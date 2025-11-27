(
    // (function(){ ... })(); makes the whole game run immediately
    function(){
    const board = document.getElementById('board');
    const scoreEl = document.getElementById('score');
    const highEl = document.getElementById('highScore');
    
    // every snake block is 16x16 px and the board is 400x280
    // so we have 25 columns and 17.5 rows (the .5 is the problem for 2 days straight ffs)
    const size=16, cols=Math.floor(400/size), rows=Math.floor(280/size);
    // fix for the .5 row issue
    board.style.width = (cols * size) + 'px';
    board.style.height = (rows * size) + 'px';

    // Responsive scale to prevent overflow in portrait mobile
    const wrapper = document.getElementById('gameWrapper');
    const scoreBar = document.getElementById('scoreBar');
    const controls = document.getElementById('controls');

    // mobile support
    function applyScale() {
        const baseW = cols * size; // 400
        const available = wrapper.clientWidth;
        const scale = Math.min(1, available / baseW);
        board.style.transformOrigin = 'top left';
        board.style.transform = `scale(${scale})`;
        // Adjust wrapper height so controls remain visible below the scaled board
        const scaledBoardH = rows * size * scale;
        wrapper.style.height = (scaledBoardH + scoreBar.offsetHeight + controls.offsetHeight) + 'px';
    }

    window.addEventListener('resize', applyScale);

    // snake starts at (x=3,y=5) moving right ([1,0] means right)
    // food starts at (x=10,y=8), running if the game is playing, score set to 0
    let snake=[[3,5]], dir=[1,0], food=[10,8], running=false, score=0;

    // gets high score from browser storage, 0 if none
    let high=+localStorage.snakeHigh||0; highEl.textContent='High Score: '+high;

    // clears the board every frame
    function draw(){
        board.innerHTML='';

        // creates a div that positions based on x,y
        snake.forEach(([x,y])=>{
            const s=document.createElement('div');
            s.className='cell snake';
            s.style.left=x*size+'px';
            s.style.top=y*size+'px';
            board.appendChild(s);
        });
        // spawns food
        const f=document.createElement('div');
        f.className='cell food';
        f.style.left=food[0]*size+'px';
        f.style.top=food[1]*size+'px';
        board.appendChild(f);
    }

    // randomizes food spawn
    function placeFood(){
        do{ food=[Math.floor(Math.random()*cols), Math.floor(Math.random()*rows)]; }
        while(snake.some(([x,y])=>x===food[0]&&y===food[1]));
    }

    // stops if game isn't running
    function tick(){
        if(!running) return;

        // calculates new head position
        // daming math ansaket sa ulo
        // sets new head position from old head + dir
        const head=[snake[0][0]+dir[0], snake[0][1]+dir[1]];

        // checks if game over
        // game over if snake hits wall or self
        if(head[0]<0||head[1]<0||head[0]>=cols||head[1]>=rows||snake.some(([x,y])=>x===head[0]&&y===head[1])){

            // handles game over
            // updates high score if score is greater than previous high score
            // waits 700ms or .7s before restarting
            running=false;
            if(score>high){ high=score; localStorage.snakeHigh=high; highEl.textContent='High Score: '+high; }
            setTimeout(start,700);
            return;
        }

        // add new head to front of snake
        snake.unshift(head);

        // checks if food is eaten
        // if head touches food, increase score, create new food, snake grows
        // else, remove tail/last segment of snake to keep same length
        // handles updated snake
        // run next game tick after 110ms or .11s (basically snake speed)
        if(head[0]===food[0]&&head[1]===food[1]){
            score++; scoreEl.textContent='Score: '+score; placeFood();
        }else snake.pop();
        draw();
        setTimeout(tick,110);
    }

    // handles game start/restart
    // if game restarts, reset snake, score, food then starts movement
    function start(){
        snake=[[3,5]]; dir=[1,0]; score=0;
        scoreEl.textContent='Score: 0'; placeFood(); running=true; draw(); applyScale(); tick();
    }

    // handles direction controls
    // controls are arrow keys or wasd/WASD
    function setDir(k){
        const map={
            ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0],
            w:[0,-1], W:[0,-1],
            s:[0,1], S:[0,1],
            a:[-1,0], A:[-1,0],
            d:[1,0], D:[1,0]
        };
        const nd=map[k]; if(!nd) return;

        // prevents reversing into yourself
        // stops you from going left to going right or going up to going down
        if(snake.length>1 && (snake[0][0]+nd[0]===snake[1][0] && snake[0][1]+nd[1]===snake[1][1])) return;
        dir=nd;
    }
    
    // sets up event listeners for keyboard and buttons
    document.addEventListener('keydown', e=>setDir(e.key));
    // On-screen button controls for mobile devices (or if ur keyboard is broken)
    document.querySelectorAll('#controls button').forEach(b=>b.onclick=()=>setDir(b.dataset.dir));
    // starts the game
    start();
})();