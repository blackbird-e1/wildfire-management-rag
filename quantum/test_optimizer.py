from optimizer import build_problem, solve_problem


def test_build_problem():
    problem = build_problem()

    assert len(problem.variables) == 9
    assert len(problem.linear_constraints) == 3


def test_resource_constraints():
    problem = build_problem()

    constraint_names = {
        constraint.name
        for constraint in problem.linear_constraints
    }

    assert "fire_engine_limit" in constraint_names
    assert "drone_limit" in constraint_names
    assert "medical_team_limit" in constraint_names


def test_solve_problem():
    problem = build_problem()

    result = solve_problem(problem)

    assert result is not None
    assert result.status is not None
    assert result.fval is not None
    assert len(result.variables_dict) == 9