ZONES = {
    "Zone A": {
        "risk": 10
    },
    "Zone B": {
        "risk": 7
    },
    "Zone C": {
        "risk": 3
    }
}

RESOURCES = {
    "fire_engine": {
        "available": 2,
        "impact": 5
    },
    "drone": {
        "available": 1,
        "impact": 3
    },
    "medical_team": {
        "available": 1,
        "impact": 2
    }
}


def calculate_coverage(zone_risk, resource_impact):
    return zone_risk * resource_impact

if __name__ == "__main__":
    for zone_name, zone in ZONES.items():
        for resource_name, resource in RESOURCES.items():
            coverage = calculate_coverage(
                zone["risk"],
                resource["impact"]
            )

            print(
                zone_name,
                "|",
                resource_name,
                "| coverage:",
                coverage
            )

ZONES = {
    "Zone A": {
        "risk": 10
    },
    "Zone B": {
        "risk": 7
    },
    "Zone C": {
        "risk": 3
    }
}


RESOURCES = {
    "fire_engine": {
        "available": 2,
        "impact": 5,
        "cost": 8
    },

    "drone": {
        "available": 1,
        "impact": 3,
        "cost": 4
    },

    "medical_team": {
        "available": 1,
        "impact": 2,
        "cost": 5
    }
}