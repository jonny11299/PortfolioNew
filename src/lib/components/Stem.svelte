<script>
	/* Sample bezier curve setup (written in Java, processing):

	int w = 400;
	int h = 800;

	// ---- Helix ----
	float turns     = 2.5;   // number of full helix twists (above the trunk)
	float amp       = 100;   // horizontal swing of the strand (px)
	float trunkLen  = 200;   // vertical height of the bezier trunk (px)
	float trunkPull = 0.6;   // 0..1, how long the trunk keeps going straight up
	int   side      =  1;     // 1 = first bend swings right, -1 = left
	int   steps     = 800;   // resolution of the helix

	// ---- Stems ----
	float stemOffset   = 0.45;  // how far past each crest the stem branches (radians of the wave)
	float stemLen      = 180;   // length of each stem (px along the curve)
	float stemRelax    = 0.016; // gentle curvature the stem relaxes into after branching
	float stemRelaxAt  = 0.12;  // fraction of the stem spent switching from the strand's bend to its own
	float stemCurl     = 0.13;  // how tightly the tip curls
	float stemCurlPow  = 4;     // higher = curl stays gentle longer, then tightens at the tip
	float stemBaseW    = 6;     // stroke weight where the stem leaves the strand
	float stemTipW     = 1.5;   // stroke weight at the tip
	int   firstStem    = 1;     // 0 = also put a stem on the crest where the trunk joins
	int   stemSteps    = 300;   // resolution of each stem

	// derived
	float cx, yJoin, k;
	ArrayList<PVector[]> stems = new ArrayList<PVector[]>();

	void setup() {
  size(400, 800);
  smooth(8);

  cx    = w / 2.0;
  yJoin = h - trunkLen;
  k     = TWO_PI * turns / yJoin;

  // Crests sit every half wavelength (PI / k px) above the join point.
  // Each stem branches a little past its crest, on the way up.
  for (int n = firstStem; ; n++) {
    float yBranch = yJoin - n * PI / k - stemOffset / k;
    if (yBranch < 0) break;
    stems.add(buildStem(yBranch));
  }
	}

	void draw() {
  background(0);
  noFill();
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // outline layer
  stroke(128);
  strokeWeight(10);
  drawStrand();
  drawStems(2);

  // main layer
  stroke(200);
  strokeWeight(8);
  drawStrand();
  drawStems(0);
	}

	// ================= Helix =================

	float helixPhase(float y) { return HALF_PI + k * (yJoin - y); }

	// x of the strand at height y, and its first and second derivatives with respect to y
	float helixX(float y)   { return cx + side * amp * sin(helixPhase(y)); }
	float helixDX(float y)  { return -side * amp * k * cos(helixPhase(y)); }
	float helixDDX(float y) { return -side * amp * k * k * sin(helixPhase(y)); }

	void drawStrand() {
  float jx = cx + side * amp;
  float jy = yJoin;
  float b  = sqrt(2.0 / 3.0) / k;           // curvature-matched handle
  float a  = trunkPull * (trunkLen - b);

  beginShape();
  vertex(cx, h);
  bezierVertex(cx, h - a, jx, jy + b, jx, jy);
  for (int i = 1; i <= steps; i++) {
    float y = map(i, 0, steps, yJoin, 0);
    vertex(helixX(y), y);
  }
  endShape();
	}

	// ================= Stems =================

	// A stem is traced by steering: at each small step it turns by the current
	// curvature. It starts with exactly the strand's direction and curvature
	// (so it forks off seamlessly), quickly swings to bend the opposite way,
	// sweeps up off the outer side of the crest, then tightens into a spiral curl.
	PVector[] buildStem(float yb) {
  PVector[] pts = new PVector[stemSteps + 1];

  float x = helixX(yb);
  float y = yb;

  // heading of the strand at the branch point (travelling upward)
  float d1 = helixDX(yb);
  float heading = atan2(-1, -d1);

  // signed curvature of the strand at the branch point
  float kb = helixDDX(yb) / pow(1 + d1 * d1, 1.5);
  float dir = kb < 0 ? -1 : 1;   // which way the strand is turning
  float kStart = abs(kb);

  float ds = stemLen / stemSteps;
  pts[0] = new PVector(x, y);

  for (int i = 0; i < stemSteps; i++) {
    float t = i / (float) stemSteps;

    float relax = smoothstep(min(t / stemRelaxAt, 1));
    // start bending with the strand, then swing to the opposite side and curl outward
    float curvature = kStart * (1 - relax) - (stemRelax * relax + stemCurl * pow(t, stemCurlPow));

    heading += dir * curvature * ds;
    x += cos(heading) * ds;
    y += sin(heading) * ds;
    pts[i + 1] = new PVector(x, y);
  }
  return pts;
	}

	// extra = added thickness for the outline layer
	void drawStems(float extra) {
  for (PVector[] pts : stems) {
    for (int i = 0; i < pts.length - 1; i++) {
      float t = i / (float) (pts.length - 1);
      strokeWeight(lerp(stemBaseW, stemTipW, t) + extra);
      line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
    }
  }
	}

	float smoothstep(float t) {
  return t * t * (3 - 2 * t);
	}


	*/
</script>
