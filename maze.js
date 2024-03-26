import {drawLines, drawLineStrip} from "./shapes2d.js";

class Cell{
    constructor(){
        this.left = true;
        this.bottom = true;
        this.right = true;
        this.top = true;
        this.visited = false;
    }
    
    draw(gl, shaderProgram, x, y){
        const vertices = [];

        if(this.left){
            vertices.push(x,y, x,y+1);
        }
        if(this.bottom){
            vertices.push(x,y, x+1,y);
        }
        if(this.right){
            vertices.push(x+1,y, x+1,y+1);
        }
        if(this.top){
            vertices.push(x,y+1, x+1,y+1);
        }

        drawLines(gl, shaderProgram, vertices, [0,0,0, 1]);
    }
}

class Maze{
    // he does this.path = []
    constructor(WIDTH, HEIGHT){
        this.WIDTH = WIDTH;
        this.HEIGHT = HEIGHT;
        this.cells = [];
        for(let r=0; r<HEIGHT; r++){
            this.cells.push([]);
            for(let c=0; c<WIDTH; c++){
                this.cells[r].push(new Cell());
            }
        }
        this.removeWalls(0,0);

        this.path= [];
        for(let r=0; r<this.HEIGHT; r++){
            for(let c=0; c<this.WIDTH; c++){
                this.cells[r][c].visited = false;
            }
        }
        this.findPath(0,0);
    }

    isSafe(x, y, radius) { // radius is fatness
        const c = Math.floor(x);
        const r = Math.floor(y);
        const offsetX = x - c;
        const offsetY = y - r;

        // Check if the right wall is there, and our radius overlaps it:
        if (this.cells[r][c].right && offsetX + radius >1)
            return false;

        // Similarily check other three walls:
        if (this.cells[r][c].left && offsetX - radius < 0)
            return false;
        if (this.cells[r][c].top && offsetY + radius > 1)
            return false;
        if (this.cells[r][c].bottom && offsetY - radius < 0)
            return false;

        // Make sure we are not in any corner:
        if (offsetX + radius > 1 && (offsetY + radius>1 || offsetY-radius<0))
            return false;
        if (offsetX - radius < 0 && (offsetY + radius>1 || offsetY-radius<0))
            return false;
        
        return true; // this is a safe location

    }



    findPath(c,r){
        this.cells[r][c].visited = true;
        this.path.push(c+.5,r+.5);
        if(c==this.WIDTH-1 && r==this.HEIGHT-1){ // the top right cell is the solution
            return true; // this cell is the solution
        }

        // move left if there is no wall, and it hasn't been visited. Return true if it returns true.
        if (!this.cells[r][c].left && !this.cells[r][c-1].visited){
            if (this.findPath(c-1,r)){
                return true; // this cell leads to the solution
            }
        }

        // Same for right, top, and bottom:
        if (!this.cells[r][c].right && !this.cells[r][c+1].visited){
            if (this.findPath(c+1,r)){
                return true;
            }
        }
        if (!this.cells[r][c].top && !this.cells[r+1][c].visited){
            if (this.findPath(c,r+1)){
                return true;
            }
        }
        if (!this.cells[r][c].bottom && !this.cells[r-1][c].visited){
            if (this.findPath(c,r-1)){
                return true;
            }
        }

        // This is a loser cell, so undo the move from this.path, and return false to the previous cell.
        this.path.pop();
        this.path.pop();
        return false;
    }

    drawPath(gl, shaderProgram){
        drawLineStrip(gl, shaderProgram, this.path, [1,0,1,1]);
    }

    removeWalls(c,r){
        this.cells[r][c].visited = true;
        const LEFT = 0;
        const BOTTOM = 1;
        const RIGHT = 2;
        const TOP = 3;
        while(true){
            // which directions are possible from the current cell?
            const available = []; 
            if(c>0 && this.cells[r][c-1].visited==false){
                available.push(LEFT);
            }
            if(c<this.WIDTH-1 && this.cells[r][c+1].visited == false){
                available.push(RIGHT);
            }
            if(r>0 && this.cells[r-1][c].visited==false){
                available.push(BOTTOM);
            }
            if(r<this.HEIGHT-1 && this.cells[r+1][c].visited == false){
                available.push(TOP);
            }

            // if we can't go forwards, go backwards.
            if (available.length == 0){
                return;
            }

            // randomly choose between the available directions, and go there.
            const random = Math.floor(Math.random()*available.length);
            const direction = available[random];

            if(direction==LEFT){
                this.cells[r][c].left = false; // remove my left wall
                this.cells[r][c-1].right = false; // remove the cell to the left's right wall
                this.removeWalls(c-1,r); // recurse left
            }            
            if(direction==RIGHT){
                this.cells[r][c].right = false;
                this.cells[r][c+1].left = false;
                this.removeWalls(c+1,r);
            }
            if(direction==BOTTOM){
                this.cells[r][c].bottom = false; 
                this.cells[r-1][c].top = false;
                this.removeWalls(c,r-1); 
            }  
            if(direction==TOP){
                this.cells[r][c].top = false; 
                this.cells[r+1][c].bottom = false;
                this.removeWalls(c,r+1); 
            }  
        } 
    }
    
    // remove the start and end walls
    removeStartAndEndWalls() {
        // remove wall at starting point
        this.cells[0][0].left = false;
        // remove wall at ending point
        this.cells[this.HEIGHT-1][this.WIDTH-1].top = false;
    }

    draw(gl, shaderProgram){
        for(let r=0; r<this.HEIGHT; r++){
            for(let c=0; c<this.WIDTH; c++){
                this.cells[r][c].draw(gl, shaderProgram, c, r);
                this.removeStartAndEndWalls();
            }
        }

    }
}

export {Maze};
