class Game {
    constructor() {
        this.obstaclesArr = [];
        this.progress = 0;
        this.maxSpawnInterval = 5000;
        this.minSpawnInterval = 2000;
        this.obstMinSpeed = 15;
        this.obstMaxSpeed = 85;
        this.gameDuration = 24000; //cicles of 25ms;
        this.chubbyOne = new Chubby("chubbyOne", "./images/chubby-1.gif");
        this.background = new Background("background", "./images/chubby_bg1.png")
    }

    update() {
        this.chubbyOne.update();
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
        
    }
    obstacleHit() {
        this.obstaclesArr.forEach((obstacleInstance) => {
            if (
                this.chubbyOne.positionX < obstacleInstance.positionX + obstacleInstance.width &&
                this.chubbyOne.positionX + this.chubbyOne.width > obstacleInstance.positionX &&
                this.chubbyOne.positionY < obstacleInstance.positionY + obstacleInstance.height &&
                this.chubbyOne.positionY + this.chubbyOne.height > obstacleInstance.positionY
            ) {
                console.log("GAME OVER!")
            }
        });
    }
    startObstacleSpawning() {
        this.obstacleSpawnTimer = setTimeout (() => {
            let imageSrcArray = ["./images/cogumelo_318-359650.png", "./images/groundobst1.gif", "./images/groundobst2.gif", "./images/groundobst3.gif" ]
            let newObstacle = new Obstacle ("groundObstacles", imageSrcArray);
            this.obstaclesArr.push(newObstacle);
            
            this.startObstacleSpawning();
        },this.maxSpawnInterval - (this.maxSpawnInterval - this.minSpawnInterval) * this.progress);
    }
    cleanUpObstacles() {
        let filteredArr = this.obstaclesArr.filter((obstacleInstance) => {
            if (obstacleInstance.positionX < -obstacleInstance.width) {
                obstacleInstance.domElement.remove();
                return false;
            } else {
                return true;
            }
        });
        this.obstaclesArr = filteredArr;
    }
}

const groundY = 92;

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
    };
    moveLeft(speed) {
        this.positionX -=speed;
        if (this.positionX < -this.width) {
            this.positionX = 0
        }
        this.backgroundElement.style.left = this.positionX + "px";
        this.duplicateElement.style.left = this.positionX + this.width + "px";
    }
}


class Chubby {
    constructor(id, imageSrc) {
        this.id = id;
        this.imageSrc = imageSrc;
        this.width = 50;
        this.height = 50;
        this.positionX = 200;
        this.positionY = groundY;
        this.speedY = 0;
        this.gravity = 2;
        this.imgScale = 1.5;
        this.imageOffsetX = ((this.imgScale * this.width) - this.width)/2;
        this.imageOffsetY = ((this.imgScale * this.height) - this.height)/2;



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
        if (this.positionY === groundY) {
            this.speedY = 25;
        }
    }
    update() {
        this.speedY -= this.gravity;
        this.positionY += this.speedY;
        if (this.positionY < groundY) {
            this.positionY = groundY;
            this.speedY = 0;
        }
        this.domElement.style.bottom = (this.positionY - this.imageOffsetY) + "px";
    }
}





class Obstacle {
    constructor(id, imageSrcArray) {
        this.id = id;
        this.imageSrcArray = imageSrcArray;
        this.width = 50;
        this.height = 40;
        this.scale = 1.5;
        this.domElement = null;
        this.positionX = 1200;
        this.positionY = groundY - 10;

        this.selectedImagesSrc = this.imageSrcArray[Math.floor(Math.random() * this.imageSrcArray.length)];

        this.createDomElement();
        
    };

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
    };
    moveLeft(speed) {
        this.positionX -=speed;
        this.domElement.style.left = this.positionX + "px";
    }
};




const game = new Game();

setInterval(() => {
    game.update()
}, 25);



game.startObstacleSpawning();





document.addEventListener("keydown", (jump) => {
    if (jump.key === "1") {
        game.chubbyOne.jump();
        console.log("pressed key");
    } /*else if (jump.key === "2") {
        chubbyTwo.jump();
        console.log("pressed key");
    }*/
});

