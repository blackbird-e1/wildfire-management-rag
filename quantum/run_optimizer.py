import json
import sys

from optimizer import build_problem, solve_problem
from resource_model import ZONES


def main():

    # ---------------------------------------------------------
    # Read input only when explicitly requested.
    #
    # Normal:
    #   python run_optimizer.py
    #
    # Node:
    #   python run_optimizer.py --stdin
    # ---------------------------------------------------------

    if "--stdin" in sys.argv:

        input_data = sys.stdin.read().strip()

        if input_data:

            request = json.loads(input_data)

            zones = request.get("zones", [])

            for zone in zones:

                zone_id = zone.get("id")
                risk = zone.get("risk")

                if zone_id in ZONES and risk is not None:

                    ZONES[zone_id]["risk"] = float(risk)

    # ---------------------------------------------------------
    # Build and solve optimization problem
    # ---------------------------------------------------------

    problem = build_problem()

    result = solve_problem(problem)

    # ---------------------------------------------------------
    # Convert optimization result into API-friendly format
    # ---------------------------------------------------------

    deployment = []

    for variable, value in result.variables_dict.items():

        if value == 1:

            zone_name, resource_name = variable.split(
                "_",
                1
            )

            deployment.append({
                "zone": zone_name,
                "resource": resource_name
            })

    response = {
        "success": True,
        "objective": result.fval,
        "status": str(result.status),
        "deployment": deployment
    }

    print(json.dumps(response))


if __name__ == "__main__":
    main()