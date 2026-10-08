GlowScript 3.2 VPython

class Particle:
    def __init__(self, pos, charge=1):
        self.body = sphere(pos=pos, radius=0.1)
        self.charge = charge

    def field_at(self, point):
        r = point - self.body.pos
        return self.charge * hat(r) / mag2(r)

def total_field(particles, point):
    E = vec(0,0,0)
    for p in particles:
        E += p.field_at(point)
    return E

particles = [Particle(vec(x, 0, 0), (-1)**x) for x in range(-2, 3)]
squares = {n: n*n for n in range(5)}
names = sorted(["b", "a", "c"])
for x in range(-3, 4):
    pt = vec(x, 1, 0)
    arrow(pos=pt, axis=total_field(particles, pt), color=color.orange)
print(squares[3], names, len(particles))
try:
    value = int("not a number")
except:
    value = -1
print("value:", value)
