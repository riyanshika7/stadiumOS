
def binary_search_locations(locations: list, target_name: str, is_sorted: bool = False):
    """
    Performs a binary search on a list of location objects sorted by their name.
    Time Complexity: O(log n) compared to linear search O(n).
    
    :param locations: List of StadiumLocation database models or dictionary objects.
    :param target_name: The string name of the location we are searching for.
    :param is_sorted: If True, assumes the input list is already sorted by name.
    :return: The location object if found, otherwise None.
    """
    # Sort the list by name if not already pre-sorted.
    sorted_locations = locations if is_sorted else sorted(locations, key=lambda x: x.name.lower())
    
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
