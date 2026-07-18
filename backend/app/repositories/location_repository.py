import bisect
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from backend.app.models import StadiumLocation

class SortedLocationIndex:
    def __init__(self):
        # Pairs of (lowercase_name, location_id)
        self._pairs: List[Tuple[str, int]] = []
        self._keys: List[str] = []

    def _search_keys(self) -> List[str]:
        """Return the maintained key index; tolerate direct test-fixture setup."""
        if len(self._keys) != len(self._pairs):
            self._keys = [name for name, _ in self._pairs]
        return self._keys

    def find(self, name: str) -> Optional[int]:
        if not name:
            return None
        target = name.strip().lower()
        # Binary search since _pairs is sorted by name
        idx = bisect.bisect_left(self._search_keys(), target)
        if idx < len(self._pairs) and self._pairs[idx][0] == target:
            return self._pairs[idx][1]
        return None

    def find_prefix(self, prefix: str) -> List[int]:
        if not prefix:
            return []
        target = prefix.strip().lower()
        results = []
        # Find first matching element
        idx = bisect.bisect_left(self._search_keys(), target)
        while idx < len(self._pairs) and self._pairs[idx][0].startswith(target):
            results.append(self._pairs[idx][1])
            idx += 1
        return results

class LocationRepository:
    def __init__(self, db: Session):
        self.db = db
        # Initialize sorted index
        self.index = SortedLocationIndex()
        self.refresh_index()

    def refresh_index(self):
        try:
            locations = self.db.query(StadiumLocation).all()
            pairs = [(loc.name.lower(), loc.id) for loc in locations]
            # Ensure index is sorted by name for binary search
            self.index._pairs = sorted(pairs, key=lambda x: x[0])
            self.index._keys = [name for name, _ in self.index._pairs]
        except Exception:
            # Gracefully handle situations where DB isn't seeded/ready
            self.index._pairs = []
            self.index._keys = []

    def get_by_name(self, name: str) -> Optional[StadiumLocation]:
        loc_id = self.index.find(name)
        if loc_id is not None:
            return self.db.query(StadiumLocation).filter(StadiumLocation.id == loc_id).first()
        # Fallback to direct DB query if index is not loaded or for robustness
        return self.db.query(StadiumLocation).filter(StadiumLocation.name == name).first()
