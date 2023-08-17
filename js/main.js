const groundY = 92;

class Game {
    constructor() {
        this.obstaclesArr = [];
        this.progress = 0;
        this.maxSpawnInterval = 2000;
        this.minSpawnInterval = 500;
        this.obstMinSpeed = 10;
        this.obstMaxSpeed = 85;
        this.gameDuration = 24000; //cicles of 25ms;
        this.chubbies = [new Chubby("chubbyOne", 0, "./images/chubby-1.gif"), new Chubby ("chubbyTwo", 1, "./images/chubby-2.gif"), new Chubby ("chubbyThree", 2, "./images/chubby-3.gif")];
        this.isImmune = false;
        this.deadChubbiesArr = [];  
        this.background = new Background("background", "./images/chubby_bg1.png")
        this.score = 0;
        this.startObstacleSpawning(groundY, groundY, 1, 1.5, ["./images/groundobst1.gif", "./images/groundobst2.gif", "./images/groundobst3.gif", "./images/groundobst4.gif" ]);
        this.startObstacleSpawning(groundY + 110, groundY + 110, 2,  3, ["./images/flyingobst-1.gif", "./images/flyingobst-2.gif", "./images/flyingimg-3.gif", "./images/flyingobst-4.gif" ] );

        setInterval(() => {
            this.update()
        }, 25);

        document.addEventListener("keydown", (jump) => {
            if (!this.canJump) return;
            if (jump.key === "1") {
                this.chubbies.forEach((chubby, index) => {
                    chubby.jump(index);
                });
                
            }
            else if (jump.key === "2") {
                this.chubbies.forEach((chubby, index) => {
                    if (index === 0) return;
                    chubby.jump(index);
                });
            }
            const soundEffect = document.getElementById("sound-effect");
            soundEffect.play();
        });
    }

    update() {
        this.chubbies.forEach((chubby, index) => {
            chubby.update(index);
        });
        this.canJump = this.chubbies.every((chubby) => {
            return chubby.hasLanded;
        });
        this.obstacleHit();
        this.progress += 1/this.gameDuration;
        if (this.progress > 1) {
            this.progress = 1
        }
        const speed = game.obstMinSpeed + (game.obstMaxSpeed - game.obstMinSpeed) * game.progress;
        this.background.moveLeft(speed);
        this.obstaclesArr.forEach((obstacleInstance) => {
            obstacleInstance.moveLeft(speed);
        });
        this.cleanUpObstacles();
1
        
    }
    obstacleHit() {
        this.obstaclesArr.forEach((obstacleInstance) => {
            this.chubbies.forEach((chubby, index) => {
                if (
                    chubby.positionX < obstacleInstance.positionX + obstacleInstance.width &&
                    chubby.positionX + chubby.width > obstacleInstance.positionX &&
                    chubby.positionY < obstacleInstance.positionY + obstacleInstance.height &&
                    chubby.positionY + chubby.height > obstacleInstance.positionY
                ) {
                    if (obstacleInstance.chubby) {
                        this.chubbies.push(obstacleInstance.chubby);
                        obstacleInstance.isToRemove = true;
                        obstacleInstance.chubby.positionY = groundY;
                        obstacleInstance.chubby.update();
                        this.chubbies.forEach ((chubby, index) => {
                            chubby.domElement.style["z-index"] = index;

                        })
                    }
                    else {
                        this.lifeLost(index);
                        obstacleInstance.canGivePoints = false;
                    }
                }
                else if (chubby.positionX > obstacleInstance.positionX + obstacleInstance.width) {
                    if (!obstacleInstance.canGivePoints) return
                    if (index !== this.chubbies.length - 1) return
                    if (chubby.positionY > obstacleInstance.positionY + obstacleInstance.height) {
                        if (this.chubbies[0].hasLanded) {
                            this.score +=20;
                        }
                        else {
                            this.score += 10;
                        }
                        this.updateScoreDisplay();  
                    }
                    obstacleInstance.canGivePoints = false;
                }  
            })

        });
    }
    lifeLost(index) {
        if (this.isImmune) return;

        if (this.chubbies.length > 1) {
            this.chubbies[index].die();
            this.deadChubbiesArr.push(this.chubbies[index]);
            this.chubbies.splice(index, 1);
            
            this.isImmune = true;
            setTimeout (() => {
                this.isImmune = false;
            }, 1000);
        }
        else {
            this.updateScoreDisplay()
            const finalScoreDisplay = "Score";
            const defaultScore = game.score;
            localStorage.setItem(finalScoreDisplay, defaultScore.toString());
            location.href = "./gameover.html"
        }
    }
    startObstacleSpawning(minY, maxY, randMin, randMax, imageSrcArray) {
        console.log("spawning")
        let spawnTime = this.maxSpawnInterval - (this.maxSpawnInterval - this.minSpawnInterval) * this.progress;
        spawnTime *= randMin + (randMax - randMin) * Math.random();
        let y = minY + (maxY - minY) * Math.random();
        this.obstacleSpawnTimer = setTimeout (() => {
            this.startObstacleSpawning(...arguments);
            let isClose = this.obstaclesArr.some((obstacle) => {
                return obstacle.positionX > 1000;
            });
            if (isClose) return;
            let newObstacle = new Obstacle ("groundObstacles", y, imageSrcArray);
            this.obstaclesArr.push(newObstacle);
            if (this.deadChubbiesArr.length > 0 && y === groundY && Math.random() < 0.05) {
                newObstacle.transformIntoChubby();
            }
            
        },spawnTime);

    }
    cleanUpObstacles() {
        let filteredArr = this.obstaclesArr.filter((obstacleInstance) => {
            if (obstacleInstance.positionX < -obstacleInstance.width) {
                obstacleInstance.domElement.remove();
                if (obstacleInstance.chubby) {
                    obstacleInstance.chubby.domElement.hidden = true;
                    this.deadChubbiesArr.push(obstacleInstance.chubby);
                    
                }
                return false;
            }else if (obstacleInstance.isToRemove) {
                obstacleInstance.domElement.remove();
                return false;
            } else {
                return true;
            }
        });
        this.obstaclesArr = filteredArr;
    }
    updateScoreDisplay() {
        const scoreDisplay = document.getElementById("scoreDisplay");
        scoreDisplay.textContent = `Score: ${this.score}`;
    }
    finalScore(){
        return this.score;
    }   
};




class Background {
    constructor (id, imageSrc) {
        this.id = id;
        this.imageSrc = imageSrc;
        this.width = 1200;
        this.height = 700;
        this.positionY = 0;
        this.positionX = 0;
        this.backgroundElement = this.createDomElement();
        this.duplicateElement = this.createDomElement();
        
    }
    createDomElement() {
        const element = document.createElement("img");
        element.classList.add("backgroundImg");
        element.src = this.imageSrc;
        element.style.width = this.width + "px";
        element.style.height = this.height + "px";
        element.style.left = this.positionX + "px";
        element.style.top = this.positionY + "px";

        const parentElm = document.getElementById("background");
        parentElm.appendChild(element);

        return element;
    }
    moveLeft(speed) {
        this.positionX -=speed;
        if (this.positionX < -this.width) {
            this.positionX = 0
        }
        this.backgroundElement.style.left = this.positionX + "px";
        this.duplicateElement.style.left = this.positionX + this.width + "px";
    }
};


class Chubby {
    constructor(id, index, imageSrc) {
        this.id = id;
        this.imageSrc = imageSrc;
        this.width = 50;
        this.height = 50;
        this.positionX = 200;
        this.positionY = this.groundY(index);
        this.speedY = 0;
        this.gravity = 2;
        this.imgScale = 1.5;
        this.imageOffsetX = ((this.imgScale * this.width) - this.width)/2;
        this.imageOffsetY = ((this.imgScale * this.height) - this.height)/2;
        this.hasLanded = true;


        this.domElement = null;
        this.createDomElement();


    }
    createDomElement() {
        this.domElement = document.createElement("img");
        this.domElement.id = this.id;
        this.domElement.classList.add("chubby");
        this.domElement.src = this.imageSrc;
        this.domElement.style.width = this.width * this.imgScale + "px";
        this.domElement.style.height = this.height * this.imgScale + "px";
        this.domElement.style.left = (this.positionX - this.imageOffsetX)  + "px";
        this.domElement.style.bottom = (this.positionY - this.imageOffsetY) + "px";

        const parentElm = document.getElementById("panel");
        parentElm.appendChild(this.domElement);
    }
    jump() {
        this.speedY = 25;
        this.hasLanded = false;
    }
    update(index) {
        this.speedY -= this.gravity;
        this.positionY += this.speedY;
        if (this.positionY < this.groundY(index)) {
            this.positionY = this.groundY(index);
            this.speedY = 0;
            this.hasLanded = true;
        }
        this.domElement.style.bottom = (this.positionY - this.imageOffsetY) + "px";
        this.domElement.style.left = this.positionX + "px";

        if (game.isImmune){
            this.domElement.hidden = !this.domElement.hidden     
        }
        else {
            this.domElement.hidden = false;   
        }
    }
    die() {
        this.domElement.hidden = true;
    }
    groundY(index) {
        return groundY + this.height * index;
    }
};


class Obstacle {
    constructor(id, y, imageSrcArray) {
        this.id = id;
        this.imageSrcArray = imageSrcArray;
        this.width = 50;
        this.height = 40;
        this.scale = 1.5;
        this.domElement = null;
        this.positionX = 1200;
        this.positionY = y - 10;
        this.canGivePoints = true;

        this.selectedImagesSrc = this.imageSrcArray[Math.floor(Math.random() * this.imageSrcArray.length)];

        this.createDomElement();        
    }

    createDomElement() {
        this.domElement = document.createElement("img");
        this.domElement.classList.add("obstacles");
        this.domElement.src = this.selectedImagesSrc;
        this.domElement.style.width = this.width * this.scale + "px";
        this.domElement.style.height = this.height * this.scale + "px";
        this.domElement.style.left = this.positionX + "px";
        this.domElement.style.bottom = this.positionY + "px";

        const parentElm = document.getElementById("panel");
        parentElm.appendChild(this.domElement);
    }
    moveLeft(speed) {
        this.positionX -=speed;
        this.domElement.style.left = this.positionX + "px";

        if (this.chubby) {
            this.chubby.domElement.style.left = this.positionX + "px";
            this.chubby.domElement.style.bottom = this.positionY + "px";
            this.chubby.domElement.hidden = false;
        }
    }
    transformIntoChubby() {
        this.chubby = game.deadChubbiesArr.pop();
        this.domElement.hidden = true;
        this.canGivePoints = false;
    }
};


const game = new Game();




