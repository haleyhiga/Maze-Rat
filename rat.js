import {drawCircle, drawLineLoop, drawTriangle, drawLineStrip} from "./shapes2d.js";

class Rat{
    constructor(x,y, degrees, maze){
        this.x = x;
        this.y = y;
        this.degrees = degrees;  // or you could store as dx and dy pair, which is redundant
        this.maze = maze;
        

        this.SPIN_SPEED = 90; // degrees per second
        this.MOVE_SPEED = 1.0; // cells per second
        this.FATNESS = .3; // for bounding circle
    }
    draw(gl, shaderProgram){
        const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [this.x, this.y, 0] );
        mat4.rotate(modelViewMatrix, modelViewMatrix,(this.degrees*Math.PI/180), [0,0,1]);
        gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

       const bodyVertices = [.3,0, -.2,.1, -.2,-.1];
        const tailVertices = [-.2,0, -.4,0, -.2,0];
        const firstWhisker = [0.4, 0.33, 0.3, 0.0, 0.0, 0.0];

       const secondWhisker = [0.5, 0.25, 0.3, 0.0, 0.0, 0.0];
       
        const thirdWhisker = [0.4, -0.33, 0.3, 0.0, 0.0, 0.0];

        const fourthWhisker = [0.5, -0.25, 0.3, 0.0, 0.0, 0.0];


        // whiskers left
        drawLineStrip(gl, shaderProgram, firstWhisker, [.0,.0,.0, 1.]);
        drawLineStrip(gl, shaderProgram, secondWhisker, [.0,.0,.0, 1.]);
    
        // whiskers right
        drawLineStrip(gl, shaderProgram, thirdWhisker, [.0,.0,.0, 1.]);
        drawLineStrip(gl, shaderProgram, fourthWhisker, [.0,.0,.0, 1.]);
        
        // nose
        drawTriangle(gl, shaderProgram, 0.15, 0.3, 0.15, -0.3, 0.4, 0.0, [0.105,.105,.105, .350] );
       
 


        // body
        drawCircle(gl, shaderProgram, 0, 0, 0.2, [0.105,.105,.105, .350]);
        //tail
        drawLineLoop(gl, shaderProgram, tailVertices, [0.9,.7,.7, 1.]);
        // eyeballs
        drawCircle(gl, shaderProgram, 0.2, -0.2, 0.1, [1.,1.0,1.0, 1.] );
        drawCircle(gl, shaderProgram, 0.2, 0.2, 0.1, [1.,1.0,1.0, 1.] );
        // pupils
        drawCircle(gl, shaderProgram, 0.25, 0.2, 0.04, [.0,.0,.0, 1.] );
        drawCircle(gl, shaderProgram, 0.25, -0.2, 0.04, [.0,.0,.0, 1.] );

    }


    spinLeft(DT){
        this.degrees += this.SPIN_SPEED*DT;
/*         if (this.degrees >=360){
            this.degrees -= 360;
        }
        if (this.degrees < 0){
            this.degrees += 360;
        } */
        this.degrees += this.SPIN_SPEED * DT;
    }

    spinRight(DT){
        this.spinLeft(-DT);
    }


    scurryForward(DT){
        const dx = Math.cos(this.degrees* Math.PI / 180);
        const dy = Math.sin(this.degrees* Math.PI / 180);
        const newX = this.x + dx*this.MOVE_SPEED*DT;
        const newY = this.y + dy*this.MOVE_SPEED*DT;


        if (this.maze.isSafe(newX, newY, this.FATNESS)){
            this.x = newX;
            this.y = newY;
        }
        else if (this.maze.isSafe(this.x, newY, this.FATNESS)){
            this.y = newY;
        }
        else if (this.maze.isSafe(newX, this.y, this.FATNESS)){
            this.x = newX;
        }

    }
    scurryBackwards(DT){
        this.scurryForward(-DT);
    }
    strafeLeft(DT){
        const dx = Math.cos(this.degrees* Math.PI / 180);
        const dy = Math.sin(this.degrees* Math.PI / 180);
        const newX = this.x - dy*this.MOVE_SPEED*DT;
        const newY = this.y + dx*this.MOVE_SPEED*DT;
        if (this.maze.isSafe(newX, newY, this.FATNESS)){
            this.x = newX;
            this.y = newY;
        }
        else if (this.maze.isSafe(this.x, newY, this.FATNESS)){
            this.y = newY;
        }
        else if (this.maze.isSafe(newX, this.y, this.FATNESS)){
            this.x = newX;
        }
    }
    strafeRight(DT){
        this.strafeLeft(-DT);
    }
}

export {Rat};