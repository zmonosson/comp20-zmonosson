function init(){
    var canvas = document.getElementById('game_canvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.onload = function(){
	ctx.drawImage(img, 320, 0, 465, 140,0, 0,465,140);
	ctx.drawImage(img, 81, 18,20,20,37,27,20,20);
	};
    img.src = 'pacman10-hp-sprite.png'; 
}