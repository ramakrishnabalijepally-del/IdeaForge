"use client";

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { IdeaListResponse, IdeaFilters } from "@/types";
import toast from "react-hot-toast";

export function useIdeas() {
  const [data, setData] = useState<IdeaListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async (filters: IdeaFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
      );
      const { data: result } = await api.get<IdeaListResponse>("/ideas", { params });
      setData(result);
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveIdea = useCallback(async (ideaId: number) => {
    try {
      await api.post(`/users/me/saved-ideas/${ideaId}`);
      toast.success("Idea saved!");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }, []);

  const unsaveIdea = useCallback(async (ideaId: number) => {
    try {
      await api.delete(`/users/me/saved-ideas/${ideaId}`);
      toast.success("Idea removed from saved.");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }, []);

  return { data, loading, error, fetchIdeas, saveIdea, unsaveIdea };
}
