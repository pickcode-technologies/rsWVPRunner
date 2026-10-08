GlowScript 3.2 VPython
# Classic intro-physics bouncing ball
floor = box(pos=vector(0,-5,0), size=vector(10,0.5,10), color=color.green)
ball = sphere(pos=vector(0,4,0), radius=1, color=color.red, make_trail=True)
ball.velocity = vector(0,-1,0)
dt = 0.01
t = 0
while t < 3:
    rate(100)
    ball.pos = ball.pos + ball.velocity*dt
    if ball.pos.y < floor.pos.y + ball.radius:
        ball.velocity.y = -ball.velocity.y
    else:
        ball.velocity.y = ball.velocity.y - 9.8*dt
    t = t + dt
print("done at t =", t)
