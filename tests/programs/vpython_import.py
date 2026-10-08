Web VPython 3.2
from vpython import *

scene.title = "Orbit"
scene.background = color.black
sun = sphere(radius=2, color=color.yellow, emissive=True)
planet = sphere(pos=vec(10,0,0), radius=0.5, texture=textures.earth, make_trail=True)
planet.p = vec(0, 3, 0)
G, M, dt = 1, 100, 0.01
graph(title="Distance", xtitle="t", ytitle="r")
r_curve = gcurve(color=color.cyan)
t = 0
while t < 5:
    rate(500)
    r = planet.pos - sun.pos
    F = -G*M*hat(r)/mag2(r)
    planet.p = planet.p + F*dt
    planet.pos = planet.pos + planet.p*dt
    r_curve.plot(t, mag(r))
    t += dt
