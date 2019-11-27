  #include "colors.inc"
  background { color White }
  camera {
    perspective       
    angle 15
    angle 15
    location <10, 8, -12>
    look_at  <0, 0,  0>
  }
  light_source { <10,10,-12> color White}   
  
  #declare ap = 0.65;
  #declare flen=2; 
  
  disc {       
    <0,0,0>, <0,0,-1> 0.7
    pigment { color Gray transmit 0.0 } 
    finish { diffuse 1 }  
    no_shadow
  }
  
  polygon{  
      5, <ap,0,-1.5>,<ap,0,0>,<0,0,flen>,<-ap,0,0>,<-ap,0,-1.5>  
      pigment { color Green transmit 0.5 }
      finish { diffuse 1 }
      no_shadow
  }
  
  polygon{
      5, <0,ap,-1.5>,<0,ap,0>,<0,0,flen>,<0,-ap,0>,<0,-ap,-1.5>  
      pigment { color blue 1.0 transmit 0.4 } 
      finish { diffuse 1 }
      no_shadow
  } 
  
  #declare xscale=3.5;
  
  polygon {
    4, <0,0,0>,<0,1,0>,<1,1,0>,<1,0,0>  
     pigment {
      image_map {png "spherical-ray-diag.png"
      once
      }
    }
    scale <xscale,2*ap,1>
    translate <-1.5,-ap,0> 
    rotate <0,-90,0>      
    rotate <0,0,-90>    
    translate <0,-0.0001,0>  
    no_shadow
  }
 
  




