from qiskit import generate_preset_pass_manager
from qiskit_aer import AerSimulator
from qiskit_aer.primitives import SamplerV2

from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit_optimization.minimum_eigensolvers import QAOA
from qiskit_optimization.optimizers import COBYLA

from resource_model import ZONES, RESOURCES


def build_problem():
    problem = QuadraticProgram("wildfire_resource_allocation")

    # ---------------------------------------------------------
    # 1. Create binary variables
    # ---------------------------------------------------------
    # 1 = deploy resource to zone
    # 0 = do not deploy
    # ---------------------------------------------------------

    for zone_name in ZONES:
        for resource_name in RESOURCES:

            variable_name = f"{zone_name}_{resource_name}"

            problem.binary_var(
                name=variable_name
            )

    # ---------------------------------------------------------
    # 2. Build linear objective
    # ---------------------------------------------------------
    # Benefit = wildfire risk × resource impact
    #           - deployment cost
    # ---------------------------------------------------------

    linear_objective = {}

    for zone_name, zone in ZONES.items():

        for resource_name, resource in RESOURCES.items():

            variable_name = f"{zone_name}_{resource_name}"

            benefit = (
                zone["risk"] * resource["impact"]
                - resource["cost"]
            )

            linear_objective[variable_name] = benefit

    # ---------------------------------------------------------
    # 3. Build quadratic penalties
    # ---------------------------------------------------------
    # Penalize concentrating too many different resources
    # in the same wildfire zone.
    # ---------------------------------------------------------

    quadratic_objective = {}

    for zone_name in ZONES:

        variables = [
            f"{zone_name}_{resource_name}"
            for resource_name in RESOURCES
        ]

        for i in range(len(variables)):

            for j in range(i + 1, len(variables)):

                quadratic_objective[
                    (variables[i], variables[j])
                ] = -10

    # ---------------------------------------------------------
    # 4. Create the optimization objective
    # ---------------------------------------------------------

    problem.maximize(
        linear=linear_objective,
        quadratic=quadratic_objective
    )

    # ---------------------------------------------------------
    # 5. Resource availability constraints
    # ---------------------------------------------------------

    for resource_name, resource in RESOURCES.items():

        problem.linear_constraint(
            linear={
                f"{zone_name}_{resource_name}": 1
                for zone_name in ZONES
            },
            sense="<=",
            rhs=resource["available"],
            name=f"{resource_name}_limit"
        )

    return problem


def solve_problem(problem):

    # ---------------------------------------------------------
    # Local quantum simulator
    # ---------------------------------------------------------

    backend = AerSimulator()

    # ---------------------------------------------------------
    # Transpile QAOA circuits into instructions that
    # the Aer simulator can execute.
    # ---------------------------------------------------------

    pass_manager = generate_preset_pass_manager(
        optimization_level=2,
        backend=backend
    )

    # ---------------------------------------------------------
    # Qiskit V2 sampler
    # ---------------------------------------------------------

    sampler = SamplerV2(
        seed=42,
        default_shots=100
    )

    # ---------------------------------------------------------
    # Classical optimizer used by QAOA to tune parameters
    # ---------------------------------------------------------

    classical_optimizer = COBYLA(
        maxiter=10
    )

    # ---------------------------------------------------------
    # Quantum Approximate Optimization Algorithm
    # ---------------------------------------------------------

    qaoa = QAOA(
        sampler=sampler,
        optimizer=classical_optimizer,
        reps=1,
        pass_manager=pass_manager
    )

    # ---------------------------------------------------------
    # Connect QAOA to the binary optimization problem
    # ---------------------------------------------------------

    minimum_eigen_optimizer = MinimumEigenOptimizer(
        qaoa
    )

    result = minimum_eigen_optimizer.solve(
        problem
    )

    return result


if __name__ == "__main__":

    # ---------------------------------------------------------
    # Build wildfire resource allocation problem
    # ---------------------------------------------------------

    problem = build_problem()

    print("Optimization problem:")
    print(problem.prettyprint())

    # ---------------------------------------------------------
    # Run quantum optimization
    # ---------------------------------------------------------

    result = solve_problem(problem)

    print("\nOptimization result:")
    print(result.prettyprint())

    # ---------------------------------------------------------
    # Display recommended deployment
    # ---------------------------------------------------------

    print("\nRecommended deployment:")

    for variable, value in result.variables_dict.items():

        if value == 1:
            print("Deploy:", variable)