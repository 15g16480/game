import * as p5 from 'p5';

import * as Matter from 'matter-js';

import drawBody from './drawBody';
import Player from './Player'

// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;
var SAT: any = (Matter as any).SAT

abstract class GameObject {
    body: Matter.Body;
    constructor(body: Matter.Body) {
        this.body = body;
    }
    draw(s: p5) {

    }
}

class Mob extends GameObject {
    isAlive: boolean;
    constructor(body: Matter.Body) {
        super(body)
    }
}

class Ground extends GameObject {
    body: Matter.Body;
    constructor(body: Matter.Body) {
        super(body)
    }
}
class Wall extends GameObject {
    constructor(body: Matter.Body) {
        super(body)
    }
}
class Platform extends GameObject{
    constructor(body: Matter.Body) {
        super(body)
    }
}
class Checkpoint extends GameObject{
    constructor(body: Matter.Body){
        super(body)
    }
}
class Bounds extends GameObject{
    constructor(body: Matter.Body){
        super(body)
    }
}

let sketch = function (p: p5) {
    // create an engine
    let engine: Matter.Engine;
    //create bodies
    let player: Player;
    let mobs: Mob[] = [];
    let ground: Ground[] = [];
    let checkpoint: Checkpoint[] = [];
    let wall: Wall[] = [];
    let platform: Platform[] = [];
    let bounds: Bounds[] = [];
    let deathCount = 0;
    //let bottom: Matter.Body;
    let gravPower: Matter.Body;
    let sjumpPower: Matter.Body;
    let checkpointA: Matter.Body;
    let checkpointB: Matter.Body;
    let buttonCD = 0;
    let hasGrav = false;
    let hasSJump = false;
    let gravPowerInvalid = false;
    let sjumpPowerInvalid = false;
    let jumpTime = 0;
    let jumpTimer = 200;
    let sjumpTimer = 300;
    let gravTime = 0;
    let gravTimer = 1000;
    let collisionFix = 0;
    let collisionFixer = 1;
    let death = false;
    let mobADeath = false;
    let mobBDeath = false;
    let playerGrounded = false;
    let doubleJump = false;
    let livesLost = false;
    let invulnerablity = 0;
    let invulnerablilityTimer = 500;

    p.setup = function () {
        p.frameRate(60);
        //moves canvas to fit the webpage
        let cnv = p.createCanvas(window.innerWidth + 10, window.innerHeight + 99);
        cnv.position(-10, -20)
        engine = Engine.create();
        //render.options.wireframes = false;
        // create player
        player = new Player();
        mobs.push(new Mob(Bodies.rectangle(900, 630, 40, 40, { inertia: Infinity, friction: 0 })));
        mobs.push(new Mob(Bodies.rectangle(1100, 630, 40, 40, { inertia: Infinity, friction: 0 })));
        ground.push(new Ground(Bodies.rectangle(400, 410, 810, 30, { isStatic: true })));
        ground.push(new Ground(Bodies.rectangle(800, 670, 600, 30, { isStatic: true })));
        ground.push(new Ground(Bodies.rectangle(1600, 670, 810, 30, { isStatic: true })));
        ground.push(new Ground(Bodies.rectangle(1600, 480, 810, 30, { isStatic: true })));
        wall.push(new Wall(Bodies.rectangle(0, 400, 100, 1000, { isStatic: true })));
        ground.push(new Ground(Bodies.rectangle(480, 1000, 1000, 30, { isStatic: true })));
        platform.push(new Platform(Bodies.rectangle(1600, 480, 810, 30, { isStatic: true })));
        ground.push(new Ground(Bodies.rectangle(1600, 480, 810, 30, { isStatic: true })));
        bounds.push(new Bounds(Bodies.rectangle(-500, 1170, 10000, 500, { isStatic: true })));
        gravPower = Bodies.circle(800, 630, 20, { isStatic: true });
        sjumpPower = Bodies.circle(900, 630, 20, { isStatic: true });
        checkpointA = Bodies.circle(1300, 630, 20, { isStatic: true });
        checkpointB = Bodies.circle(1400, 440, 20, { isStatic: true });
        checkpointA.isSensor = true
        checkpointB.isSensor = true
        sjumpPower.isSensor = true
        gravPower.isSensor = true
        World.add(engine.world, [player.body, gravPower, sjumpPower, checkpointA, checkpointB]);
        ground.forEach(g => World.add(engine.world, g.body));
        wall.forEach(w => World.add(engine.world, w.body));
        mobs.forEach(m => World.add(engine.world, m.body));
        bounds.forEach(b => World.add(engine.world, b.body));
        //collisions for checkpoint saving
        Matter.Events.on(engine, "collisionEnd", function (event) {
            event.pairs
                .filter(pair => pair.bodyA.id == player.body.id || pair.bodyB.id == player.body.id)
                .forEach(pair => {
                    let possibleCheckpoint = pair.bodyA.id == player.body.id ? pair.bodyB : pair.bodyA;
                    if (possibleCheckpoint.id == checkpointA.id || possibleCheckpoint.id == checkpointB.id) {
                        player.hitCheckpoint(possibleCheckpoint.position.x, possibleCheckpoint.position.y);
                    }
                });
        });

        //collisions for playing hit ceiling/floor
        //bounds.forEach(b => {}
        /*Matter.Events.on(engine, "collisionStart", function (event) {
            event.pairs
                .filter(pair => pair.bodyA.id == player.body.id || pair.bodyB.id == player.body.id)
                .forEach(pair => {
                    let edgeOfVerticalMap = pair.bodyA.id == player.body.id ? pair.bodyB : pair.bodyA;
                    if (edgeOfVerticalMap.id == b.body.id) {
                        death = true;
                    }
                });
        });*/
        // Matter.Events.on(engine, "collisionStart", function (event) {
        //     event.pairs
        //         .filter(pair => pair.bodyA.id == player.body.id || pair.bodyB.id == player.body.id)
        //         .forEach(pair => {
        //             let mobCollides = pair.bodyA.id == player.body.id ? pair.bodyB : pair.bodyA;
        //             if (mobCollides.id == mobA.id || mobCollides.id == mobB.id) {

        //                     if (Math.round(player.position.y) >= Math.round(mobA.position.y) - 30 && mobADeath == false) {
        //                         death = true
        //                     }
        //                     else if (death == false && Math.round(player.position.y) <= Math.round(mobA.position.y) - 30 && mobADeath == false) {
        //                         Matter.Composite.remove(engine.world, mobA);
        //                         mobADeath = true;
        //                     }
        //                     else if (Math.round(player.position.y) >= Math.round(mobB.position.y) - 30 && mobBDeath == false) {
        //                         death = true
        //                     }
        //                     else if (death == false && Math.round(player.position.y) <= Math.round(mobB.position.y) - 30 && mobBDeath == false) {
        //                         Matter.Composite.remove(engine.world, mobB);
        //                         mobBDeath = true;
        //                     }


        //             }
        //         });
        // });
        p.fill(400);
        p.text('whagwan', 10, 10, 70, 80)
    };
    p.draw = function () {
        Engine.update(engine, 30);
        p.background(20);
        p.frameRate(60);
        p.translate(-player.body.position.x + innerWidth / 2, 0/*-player.position.y + innerHeight/2*/)

        // Draw all bodies
        // p5 and matter js meeting
        engine.world.bodies.forEach(body => {
            drawBody(p, body, 'green');
        });

        player.draw(p);

        mobs.forEach(m => drawBody(p, m.body, 'purple'));

        drawBody(p, checkpointA, 'yellow');
        drawBody(p, checkpointB, 'yellow');
        // Draw all bodies
        // p5 and matter js meeting
        // engine.world.bodies.forEach(body => {
        //     p.beginShape()
        //     body.vertices.forEach(vertex => {
        //         p.vertex(vertex.x, vertex.y);
        //     })
        //     p.endShape(p.CLOSE);
        // });

        //mob collision
        mobs.forEach(m => {

            let collisionMob = SAT.collides(player.body, m);

            //mob collision 
            if (collisionMob.collided && mobADeath == false) {
                let now = Date.now();
                if ((now - collisionFix) > collisionFixer) {
                    if (Math.round(player.body.position.y) >= Math.round(m.body.position.y) - 30) {
                        livesLost = true
                    }
                    else if (death == false && Math.round(player.body.position.y) <= Math.round(m.body.position.y) - 30) {
                        Matter.Composite.remove(engine.world, m.body);
                        mobADeath = true;
                    }
                    collisionFix = now;
                }

            }

        })
        // platform.forEach(plat => {
        //     if(Math.round(plat.body.position.x) == 400 && Math.round(plat.body.position.y) == 1600) {

        //     }
        // });
        //grounding the player
        ground.forEach(g => {
            Matter.Events.on(engine, "collisionStart", function (event) {
                event.pairs
                    .filter(pair => pair.bodyA.id == player.body.id || pair.bodyB.id == player.body.id)
                    .forEach(pair => {
                        let possibleGrounding = pair.bodyA.id == player.body.id ? pair.bodyB : pair.bodyA;
                        if (possibleGrounding.id == g.body.id) {
                            playerGrounded = true;
                        }
                    });
            });
            Matter.Events.on(engine, "collisionEnd", function (event) {
                event.pairs
                    .filter(pair => pair.bodyA.id == player.body.id || pair.bodyB.id == player.body.id)
                    .forEach(pair => {
                        let possibleGrounding = pair.bodyA.id == player.body.id ? pair.bodyB : pair.bodyA;
                        if (possibleGrounding.id == g.body.id) {
                            playerGrounded = false;
                        }
                    });
            });
        })

        //Player Health system
        if (player.lives == 0) {
            death = true
        }

        if (livesLost == true) {
            let now = Date.now();
            if ((now - invulnerablity) > invulnerablilityTimer) {
                player.lives = player.lives - 1
                //change color here
            }
            invulnerablity = now;
            livesLost = false
        }
        //Player death
        if (death == true && deathCount == 0) {
            player.respawn();
            player.lives = 2
            deathCount = 1
            death = false
        }
        if (death == true && deathCount == 1) {
            player.respawn();
            player.lives = 1
            deathCount = 2
            death = false
        }
        if (death == true && deathCount == 2) {
            //refresh page

            player.spawnx = 400
            player.spawny = 370
            player.respawn();
            death = false
            deathCount = 0
            player.lives = 3
        }

        //mob targetting
        mobs.forEach(m => {
            if (m.body.position.x > player.body.position.x) {
                Matter.Body.applyForce(m.body, m.body.position, { x: -0.0001, y: 0 });
            }
            else {
                Matter.Body.applyForce(m.body, m.body.position, { x: 0.0001, y: 0 });
            }
        })

        //Powerups
        let collisionGrav = SAT.collides(player.body, gravPower);
        let collisionSJump = SAT.collides(player.body, sjumpPower);
        //super jump
        if (p.keyIsDown(87) && hasSJump == true && playerGrounded == true && doubleJump == true) {
            let now = Date.now();
            if ((now - jumpTime) > sjumpTimer && doubleJump == true) {
                Matter.Body.applyForce(player.body, player.body.position, { x: 0, y: -0.1 });
                jumpTime = now;
            }
        }
        if (p.keyIsDown(87) && hasSJump == true && playerGrounded == false && doubleJump == true) {
            let now = Date.now();
            if ((now - jumpTime) > sjumpTimer && doubleJump == true) {
                Matter.Body.applyForce(player.body, player.body.position, { x: 0, y: -0.1 });
                doubleJump = false;
                jumpTime = now;
            }
        }
        if (collisionSJump.collided && p.keyIsDown(81) && sjumpPowerInvalid == false) {
            hasSJump = true;
            Matter.Composite.remove(engine.world, sjumpPower);
            sjumpPowerInvalid = true
        }
        if ((collisionSJump.collided && p.keyIsDown(81)) && hasGrav == true && sjumpPowerInvalid == true) {
            hasSJump = true;
            hasGrav = false;
            World.add(engine.world, gravPower);
            sjumpPowerInvalid = false;
        }

        //gravity jump
        if (p.keyIsDown(87) && hasGrav == true && playerGrounded == true && engine.world.gravity.y == -1 && doubleJump == true) {
            let now = Date.now();
            if ((now - jumpTime) > jumpTimer) {
                Matter.Body.applyForce(player.body, player.body.position, { x: 0, y: 0.06 });
                jumpTime = now;
            }
        }
        if (p.keyIsDown(87) && hasGrav == true && playerGrounded == false && engine.world.gravity.y == -1 && doubleJump == true) {
            let now = Date.now();
            if ((now - jumpTime) > jumpTimer) {
                Matter.Body.applyForce(player.body, player.body.position, { x: 0, y: 0.06 });
                doubleJump = false;
                jumpTime = now;
            }
        }
        if (collisionGrav.collided && p.keyIsDown(81) && gravPowerInvalid == false) {
            hasGrav = true;
            Matter.Composite.remove(engine.world, gravPower);
            gravPowerInvalid = true
        }
        if ((collisionGrav.collided && p.keyIsDown(81)) && hasSJump == true && gravPowerInvalid == true) {
            hasGrav = true;
            hasSJump = false;
            World.add(engine.world, sjumpPower);
            gravPowerInvalid = false;
        }

        //R to reset position
        if (p.keyIsDown(82)) {
            player.respawn();
        }

        //Movement
        //W
        if (p.keyIsDown(87) && playerGrounded == true && hasSJump == false && engine.world.gravity.y == 1 && doubleJump == true) {
            let now = Date.now();
            if ((now - jumpTime) > jumpTimer) {
                Matter.Body.applyForce(player.body, player.body.position, { x: 0, y: -0.06 });
                jumpTime = now;
            }
        }
        if (p.keyIsDown(87) && playerGrounded == false && hasSJump == false && engine.world.gravity.y == 1 && doubleJump == true) {
            let now = Date.now();
            if ((now - jumpTime) > jumpTimer) {
                Matter.Body.applyForce(player.body, player.body.position, { x: 0, y: -0.06 });
                doubleJump = false;
                jumpTime = now;
            }

        }
        if (playerGrounded == true) {
            doubleJump = true;
            console.log(player.body.position.x, player.body.position.y)
        }
    }

    p.keyPressed = function () {
        //this changes gravity on toggle of E 
        if (p.keyCode == 69 && hasGrav == true) {
            let now = Date.now();
            if ((now - gravTime) > gravTimer) {
                engine.world.gravity.y *= -1;
                gravTime = now;
            }
        }
        //fullscreens on P
        if (p.keyCode == 80) {
            let fs = p.fullscreen();
            p.fullscreen(!fs);
        }
    }
};


let myp5 = new p5(sketch);