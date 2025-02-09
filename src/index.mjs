import { matrix, multiply, dotMultiply, dotDivide, add, cos, sin, pi } from "mathjs";

const screenW = 1000
const screenH = 1000
const canvas = document.createElement("canvas");
[canvas.width, canvas.height] = [screenW, screenH];
document.body.append(canvas);

const render = (dt) => {

  const [vrt, lines] = getUnitCube()

  const Transform = getTransform(0, 0, -5)
  const Rotate = getRotate(dt * (pi / 8), dt * (pi / (16)), dt * (pi/32))
  const Scale = getScale(1, 1, 1)

  const Model = multiply(Transform, Rotate, Scale);

  // we made it to world space from model space
  for (const [key, value] of Object.entries(vrt)) {
    vrt[key] = multiply(Model, value);
  }

  // to make it to camera space, we move space such that the camera is at 0,0,0 facing -Z. 
  // We use the inverse of the cameras Model matrix. 
  // in our case, the camera is already at the desired location. 
  const CameraM = matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]);

  // we made it to camera space
  for (const [key, value] of Object.entries(vrt)) {
    vrt[key] = multiply(CameraM, value);
  }

  const w = 2
  const symPerspective = getSymPerspective(1, 10, w, 2)


  // we made it to clip space
  for (const [key, value] of Object.entries(vrt)) {
    const new_value = multiply(symPerspective, value);
    vrt[key] = dotDivide(new_value, w)
  }

  // map to specific width of canvas
  for (const [key, value] of Object.entries(vrt)) {
    const screen_s = matrix([screenW, screenH, 1, 1])
    const screen_t = matrix([screenW / 2, screenH / 2, 0, 0])
    vrt[key] = add(dotMultiply(value, screen_s), screen_t);
  }

  // create canvas and draw all lines
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, screenW, screenH)

  for (const [key, values] of Object.entries(lines)) {
    const fromVrt = vrt[key].valueOf()
    ctx.beginPath()
    ctx.lineWidth = 3
    for (const end of values) {
      const toVrt = vrt[end].valueOf()
      ctx.moveTo(fromVrt[0], fromVrt[1])
      ctx.lineTo(toVrt[0], toVrt[1])
    }
    ctx.stroke()
  }
}


const getUnitCube = () => {
  // define cube
  const vrt = {
    0: matrix([-1, -1, -1, 1]),
    1: matrix([-1, -1, +1, 1]),
    2: matrix([-1, +1, -1, 1]),
    3: matrix([-1, +1, +1, 1]),
    4: matrix([+1, -1, -1, 1]),
    5: matrix([+1, -1, +1, 1]),
    6: matrix([+1, +1, -1, 1]),
    7: matrix([+1, +1, +1, 1]),
  };

  const lines = {
    0: [1, 2, 4],
    1: [3, 5],
    2: [3, 6],
    3: [7],
    4: [5, 6],
    5: [7],
    6: [7],
  };


  // connections between vertices

  return [vrt, lines]
}


const getTransform = (x_t, y_t, z_t) => {
  const Transform = matrix([
    [1, 0, 0, x_t],
    [0, 1, 0, y_t],
    [0, 0, 1, z_t],
    [0, 0, 0, 1],
  ]);
  return Transform
}

const getRotate = (x_r, y_r, z_r) => {
  const R_x = matrix([
    [1, 0, 0, 0],
    [0, cos(x_r), -sin(x_r), 0],
    [0, sin(x_r), cos(x_r), 0],
    [0, 0, 0, 1],
  ]);

  const R_y = matrix([
    [cos(y_r), 0, sin(y_r), 0],
    [0, 1, 0, 0],
    [-sin(y_r), 0, cos(y_r), 0],
    [0, 0, 0, 1],
  ]);

  const R_z = matrix([
    [cos(z_r), -sin(z_r), 0, 0],
    [sin(z_r), cos(z_r), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);

  const Rotate = multiply(R_z, R_y, R_x)
  return Rotate
}

const getScale = (x_s, y_s, z_s) => {
  const Scale = matrix([
    [x_s, 0, 0, 0],
    [0, y_s, 0, 0],
    [0, 0, z_s, 0],
    [0, 0, 0, 1],
  ]);
  return Scale
}

const getSymPerspective = (n, f, w, h) => {

  const symPerspective = matrix([
    [n / w, 0, 0, 0],
    [0, n / h, 0, 0],
    [0, 0, (f + n) / (n - f), (2 * f * n) / (n - f)],
    [0, 0, -1, 0]]);
  return symPerspective
}

const getStepFn = () => {
  let dt = 0
  return function step() {
    dt += 0.02
    render(dt)
    requestAnimationFrame(step)
  }

}

requestAnimationFrame(getStepFn())