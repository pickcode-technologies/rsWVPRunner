from vpython import *
ball = sphere(color=color.red)
for i in range(10):
    rate(10)
    ball.pos.x += 0.1
