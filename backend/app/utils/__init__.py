from datetime import date


def parse_date(value):
    if not value:
        return None
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value))  # raises ValueError if format is wrong
