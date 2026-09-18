from itertools import product

from resource_model import ZONES, RESOURCES


def calculate_score(selection):

    score = 0

    for zone_name, resource_name in selection:

        zone = ZONES[zone_name]
        resource = RESOURCES[resource_name]

        score += (
            zone["risk"] * resource["impact"]
            - resource["cost"]
        )

    # Diminishing-return penalty.
    for zone_name in ZONES:

        resources_in_zone = [
            resource_name
            for selected_zone, resource_name in selection
            if selected_zone == zone_name
        ]

        count = len(resources_in_zone)

        if count >= 2:
            score -= 10

        if count >= 3:
            score -= 10

    return score


def generate_allocations():

    assignments = [
        (zone_name, resource_name)
        for zone_name in ZONES
        for resource_name in RESOURCES
    ]

    best_score = float("-inf")
    best_selection = []

    for bits in product([0, 1], repeat=len(assignments)):

        selection = [
            assignments[i]
            for i, bit in enumerate(bits)
            if bit == 1
        ]

        valid = True

        for resource_name, resource in RESOURCES.items():

            count = sum(
                1
                for zone_name, selected_resource in selection
                if selected_resource == resource_name
            )

            if count > resource["available"]:
                valid = False
                break

        if not valid:
            continue

        score = calculate_score(selection)

        if score > best_score:
            best_score = score
            best_selection = selection

    return best_score, best_selection


if __name__ == "__main__":

    score, selection = generate_allocations()

    print("Classical optimization")
    print("----------------------")

    print("Objective:", score)

    print("\nDeployment:")

    for zone_name, resource_name in selection:
        print(
            "Deploy:",
            resource_name,
            "→",
            zone_name
        )