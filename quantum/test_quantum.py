from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


circuit = QuantumCircuit(2, 2)

circuit.h(0)
circuit.cx(0, 1)

circuit.measure([0, 1], [0, 1])


simulator = AerSimulator()

result = simulator.run(
    circuit,
    shots=1000
).result()

counts = result.get_counts()

print("Quantum simulation result:")
print(counts)