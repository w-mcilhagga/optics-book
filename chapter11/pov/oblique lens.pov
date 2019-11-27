  #include "colors.inc"
  #declare ap = 0.55;
  #declare ap2 = 0.65; 
  #declare mul = 0.4;
  #declare flenh=2.5;
  #declare r = 2; 
  
  background { color White }
  camera {
    perspective       
    angle 15
    location <6, 15, -12>
    look_at  <0, 0,  0>
  }
  light_source { <10,10,-12>+<0.5,0.5,0.5> color White}    
 
  object{
  union {
  object {
  difference {
      sphere { 
        <0, 0, r-0.1>, r 
        scale 1.1*y
        hollow      
      }
      box { 
        <r, r, 0>, <-r,-r,2*r>  
        pigment { color red 1 green 1 blue 1 transmit 1 }
      } 
      pigment { color Gray transmit 0.0 } 
      finish { diffuse 1 } 
      no_shadow
    } 
    clipped_by {   
        cylinder {     
          <0,0,-1>, <0,0,1>, 1
        }
    }
	rotate <0,-30,0>
  }
  polygon{  
      //6, <ap2,0,-1.5>,<ap2,0,0>,<-ap2*mul,0,flenh>,<ap2*mul,0,flenh>,<-ap2,0,0>,<-ap2,0,-1.5>  
      5, <ap2,0,-1.5>,<ap2,0,0>,<0,0,flenh/1.4>,<-ap2,0,0>,<-ap2,0,-1.5>  
      pigment { color Green transmit 0.4 }
      finish { diffuse 1 }
      no_shadow
      rotate <0,0,90>
  }
  polygon{
      5, <0,ap,-1.5>,<0,ap,-0.3>,<0,0,flenh>,<0,-ap,0.3>,<0,-ap,-1.5>  
      pigment { color blue 1.0 transmit 0.4 } 
      finish { diffuse 1 }
      no_shadow
      rotate <0,0,90>
  }
  } 
  translate <0.75,0,0>
  }
   
  object {
  union {
  object {
  difference {
      sphere { 
        <0, 0, r-0.1>, r 
        scale 1.1*y
        hollow      
      }
      box { 
        <r, r, 0>, <-r,-r,2*r>  
        pigment { color red 1 green 1 blue 1 transmit 1 }
      } 
      pigment { color Gray transmit 0.0 } 
      finish { diffuse 1 } 
      no_shadow
    } 
    clipped_by {   
        cylinder {     
          <0,0,-1>, <0,0,1>, 1
        }
    }
  }
  polygon{  
      5, <ap2,0,-1.5>,<ap2,0,0>,<0,0,flenh/1.4>,<-ap2,0,0>,<-ap2,0,-1.5>  
      pigment { color Green transmit 0.4 }
      finish { diffuse 1 }
      no_shadow
      rotate <0,0,90>
  }
  polygon{
      5, <0,ap,-1.5>,<0,ap,0>,<0,0,flenh/1.4>,<0,-ap,0>,<0,-ap,-1.5>  
      pigment { color blue 1.0 transmit 0.4 } 
      finish { diffuse 1 }
      no_shadow
      rotate <0,0,90>
  }
  }
  translate <-0.75,0,0>
  }



