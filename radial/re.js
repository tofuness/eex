window.onload = () => {
  const interpolator = interpolateRGB([100, 100, 100], [255, 255, 255]);
  const space = new CanvasSpace('mount').setup({
    bgcolor: '#111'
  });
  const form = new Form(space);

  class Component {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }

  class Crank extends Component {
    constructor(ops) {
      super(ops.x, ops.y);
      this.angle = 0;
      this.radius = ops.radius;
      this.speed = ops.speed;
      this.stagger = ops.stagger;
      this.p1 = { x: 0, y: 0 };
    }
    stroke() {
      const angleX = Math.cos(this.angle);
      const angleY = -Math.sin(this.angle);
      this.p1 = {
        x: this.x + angleX * this.radius,
        y: this.y + angleY * this.radius
      };
      return this.p1;
    }
    update(time) {
      this.angle = (this.speed * (time + this.stagger)) / 1000 % 1 * Math.PI * 2;
      this.stroke();
    }
    render(form, time) {
      this.update(time);
    }
  }

  class ConnectingRod extends Component {
    constructor(ops) {
      super(0, 0);
      this.crank = ops.crank;
      this.angle = ops.angle;
      this.size = ops.size;
      this.p1 = { x: 0, y: 0 };
      this.h = 0;
      this.hMin = Infinity;
      this.hMax = -Infinity;
      if (this.size < this.crank.radius) {
        throw new Error('Connecting rod needs to be equal or larger than crank radius');
      }
    }
    littleEnd() {
      const rcos = this.crank.radius * Math.cos(this.angle - this.crank.angle);
      const l2 = Math.pow(this.size, 2);
      const r2 = Math.pow(this.crank.radius, 2);
      const sin2 = Math.pow(Math.sin(this.crank.angle), 2);
      const h = rcos + Math.sqrt(l2 - r2 * sin2);

      this.hMin = Math.min(h, this.hMin);
      this.hMax = Math.max(h, this.hMax);

      let nH = 0;
      if (this.hMin !== this.hMax) {
        nH = Util.mapToRange(this.h, this.hMin, this.hMax, 0, 1);
      }
      const dX = Math.cos(this.angle) * h + Math.sin(nH * Math.PI) * 20;
      const dY = -Math.sin(this.angle) * h + Math.sin(nH * Math.PI) * 60;
      this.h = h;
      this.p1 = {
        x: this.crank.x + dX,
        y: this.crank.y + dY
      };
      return this.p1;
    }
    bigEnd() {
      this.x = this.crank.p1.x;
      this.y = this.crank.p1.y
    }
    update() {
      this.bigEnd();
      this.littleEnd();
    }
    render() {
      this.update();
      form.line(new Line(this).to(this.p1));
    }
  }

  class Piston extends ConnectingRod {
    constructor(ops) {
      super(ops);
      this.radius = ops.radius * Math.random();
    }
    render(form, time) {
      this.update();
      if (this.hMin !== this.hMax) {
        const nH = Util.mapToRange(this.h, this.hMin, this.hMax, 0, 1);
        const clr = `rgb(${interpolator(nH).map(c => Math.floor(c)).join(',')}`;
        form.stroke(clr, 1);
        form.stroke(false);
        form.fill(clr);
        form.circle(new Circle(this.p1).setRadius(Math.max(nH, 0.5) * this.radius));
      }
    }
  }

  class CrankPin extends Crank {
    render(form, time) {
      this.update(time);
      form.stroke('#333', 3, 'round', 'round');
      // form.line(new Line(this).to(this.p1));
      form.stroke(false);
      form.fill('#fff');
      form.circle(new Circle(this.p1).setRadius(1));
    }
  }

  class MovingCrank extends Crank {
    constructor(ops) {
      super(ops);
      this.origX = ops.x;
      this.origY = ops.y;
    }
    update(time) {
      this.angle = (this.speed * (time + this.stagger)) / 1000 % 1 * Math.PI * 2;
      this.x = this.origX + Math.cos(time / 5000 % 1 * Math.PI * 2) * 100;
      this.y = this.origY + Math.sin(time / 5000 % 1 * Math.PI * 2) * 100;
      this.stroke();
    }
  }

  const cranks = [];
  const rods = [];
  for (var i = 1; i <= 7; i++) {
    cranks.push(
      new Crank({
        x: space.center.x,
        y: space.center.y,
        radius: i * 10,
        speed: 0.2,
        stagger: i * 100
      })
    );
    for (var j = 1; j <= (30 + i * 3); j++) {
      rods.push(
        new Piston({
          size: Math.pow(i, 0.9) * 30,
          angle: j / (30 + i * 3) * Math.PI * 2,
          crank: cranks[i - 1],
          radius: 2.5
        })
      );
    }
  }

  // Quick run through the experiement and find min/max displacement
  let dummyTime = 0;
  while (dummyTime < 5000) {
    dummyTime++;
    cranks.forEach(c => c.update(dummyTime));
    rods.forEach(r => r.update(dummyTime));
  }

  space.add({
    animate: (time, dt) => {
      cranks.forEach(c => c.update(time));
      rods.forEach(r => r.render(form, time));
    }
  });
  space.play();
}
