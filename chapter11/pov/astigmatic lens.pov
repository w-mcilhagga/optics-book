  #include "colors.inc"
  background { color White }
  camera {
    perspective       
    angle 15
    location <10, 8, -12>+<0.5,0,0.5>
    look_at  <0, 0,  0> +<0.5,0.5,0.5>
  }
  light_source { <10,10,-12>+<0.5,0.5,0.5> color White}    
  
  #declare ap = 0.65;
  #declare flenh=2.5; 
  
  object {
  difference {
      sphere { 
        <0, 0, 0.75>, 1 
        scale 1.2*y
        hollow      
      }
      box { 
        <1, 2, 0>, <-1,-2,5>  
        pigment { color red 1 green 1 blue 1 transmit 1 }
      } 
      pigment { color Gray transmit 0.0 } 
      finish { diffuse 1 } 
      no_shadow
    } 
    clipped_by {   
        cylinder {     
           <0,0,-1>, <0,0,1>, 7
        }
    }
  }
  polygon{  
      6, <ap,0,-1.5>,<ap,0,0>,<-ap*0.75,0,flenh>,<ap*0.75,0,flenh>,<-ap,0,0>,<-ap,0,-1.5>  
      pigment { color Green transmit 0.4 }
      finish { diffuse 1 }
      no_shadow
  }
  polygon{
      5, <0,ap,-1.5>,<0,ap,0>,<0,0,flenh>,<0,-ap,0>,<0,-ap,-1.5>  
      pigment { color blue 1.0 transmit 0.4 } 
      finish { diffuse 1 }
      no_shadow
  }
  cylinder {  
     <0.7,0,0>, <0.7,0,flenh/1.75>, 0.01
  }  
  cylinder {  
     <0,0.85,0>, <0,0.85,flenh>, 0.01
  }
  





