GlowScript 3.2 VPython
running = True

def toggle(b):
    global running
    running = not running
    b.text = "Run" if not running else "Pause"

def set_speed(s):
    speed_text.text = "{:.1f}".format(s.value)

button(text="Pause", bind=toggle)
scene.append_to_caption("\n\nSpeed: ")
slider(min=0, max=5, value=1, bind=set_speed)
speed_text = wtext(text="1.0")
cube = box()

def on_click(evt):
    cube.color = vec(random(), random(), random())

scene.bind("click", on_click)
for i in range(100):
    rate(30)
    if running:
        cube.rotate(angle=0.05, axis=vec(0,1,0))
