from collections import defaultdict
from datetime import date
from fastapi import HTTPException, status

# In-memory store: {user_id: {date: count}}
_usage: dict[int, dict[date, int]] = defaultdict(lambda: defaultdict(int))


def check_and_increment(user_id: int, daily_limit: int) -> None:
    today = date.today()
    count = _usage[user_id][today]
    if count >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily AI generation limit of {daily_limit} reached. Try again tomorrow.",
        )
    _usage[user_id][today] += 1


def get_usage_today(user_id: int) -> int:
    return _usage[user_id][date.today()]
