GlowScript 2.9 VPython
from visual import *
from visual.graph import *

g = gdisplay(title="Spring")
f = gcurve(color=color.blue)
mass = sphere(pos=vec(1,0,0), radius=0.2)
spring = helix(pos=vec(0,0,0), axis=mass.pos, radius=0.1, coils=10)
k, m, v, dt = 10, 1, 0, 0.01
for i in range(300):
    rate(200)
    a = -k*mass.pos.x/m
    v += a*dt
    mass.pos.x += v*dt
    spring.axis = mass.pos
    f.plot(i*dt, mass.pos.x)
