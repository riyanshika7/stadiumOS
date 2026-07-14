import logging

logger = logging.getLogger(__name__)

def binary_search_locations(locations: list, target_name: str):
    """
    Performs a binary search on a list of location objects sorted by their name.
    Time Complexity: O(log n) compared to linear search O(n).
    
    :param locations: List of StadiumLocation database models or dictionary objects.
    :param target_name: The string name of the location we are searching for.
    :return: The location object if found, otherwise None.
    """
    # Sort the list by name to satisfy binary search prerequisite.
    # While sorting takes O(n log n), doing it once allows repeatedly querying 
    # the list at O(log n) lookup speed.
    sorted_locations = sorted(locations, key=lambda x: x.name.lower())
    
    low = 0
    high = len(sorted_locations) - 1
    target = target_name.lower().strip()
    
    while low <= high:
        mid = (low + high) // 2
        mid_name = sorted_locations[mid].name.lower().strip()
        
        if mid_name == target:
            return sorted_locations[mid]
        elif mid_name < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return None
