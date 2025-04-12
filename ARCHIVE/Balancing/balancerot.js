var cnv
var backgroundRGB=[126, 120, 100];

var TBL

function setup() {
  cnv = createCanvas(800, 300);
  cnv.parent('sketch-holder');
  background(backgroundRGB[0],backgroundRGB[1],backgroundRGB[2]);

  //create table
  TBL=tableCreate();

  rectMode(CENTER);
  angleMode(DEGREES);
  calcola();
  noLoop();
}

function tableCreate() {
  var colheads=['body','$m$','$r$','$mr$','$l$','$mrl$','$\\theta$'];
  
  var data = [
      colheads,
      ['A', 10, 11, '', 13, '', 16],
      ['B', 10, 11, '', 13, '', 16],
      ['C', 10, 11, '', 13, '', 16],
      ['D', 10, 11, '', 13, '', 16],
      ['L', 10, 11, '', 13, '', 16],
      ['M', 10, 11, '', 13, '', 16]
    ];

  var hot = new Handsontable(document.getElementById('tablediv'), {
    data: data,
    rowHeaders: false,
    colHeaders: false,
    filters: false,
    dropdownMenu: false,
    autoColumnSize: true,
    width: '100%',
    licenseKey: 'non-commercial-and-evaluation'
  });


  return hot
}

function calcola(){
  //console.log('calced!');
  background(backgroundRGB[0],backgroundRGB[1],backgroundRGB[2]);
  drawtext()
  //drawinfi(-slider.value());
  //drawMohr();
}

function drawtext(){

}


function horzArrow(xa,ya,len,h,w,direc){
  direc=Math.sign(direc);
  push()
    rectMode(CORNER);
    if (direc==1) {
        if (abs(len)>2) {
          rect(xa,ya+w/2,len-h,-w);
          triangle(xa+len,ya,xa+len-h,ya+w*1.5,xa+len-h,ya-w*1.5);
        }
    } else {
        if (abs(len)>2) {
          rect(xa+h,ya+w/2,len,-w);
          triangle(xa,ya,xa+h,ya+w*1.5,xa+h,ya-w*1.5);
        }
      }
  pop();
}
