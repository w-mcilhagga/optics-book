  #include "colors.inc"
  background { color White }
  camera {
    perspective       
    angle 15
    location <10, 8, -12>
    look_at  <0, 0,  0>
  }
  light_source { <0,10,-12> color White}    
  
  #declare basictorus =     torus { 1,0.6 
     pigment { color Gray transmit 0.0 }
  };
  
  #declare mybox =  box {  
     <1.5,-1,-1>, <2,1,1>
     pigment { color Green  } 
     rotate <0,-20,0>
  }
  
  #declare mytorus = union {
      object {basictorus }
      difference {
        sphere { 
           <0,0,0>, 1.607
           pigment { color Black }
           scale <1,0.05,1> 
        }
        sphere {   
          <0,0,0>, 0.5 
        }
     }
     sphere { 
       <0,0,0>, 0.62 
       scale <1,1,0.05>
       translate <1,0,0>  
       rotate <0,-20,0>
     }
  }
  
  union {
    intersection { 
      object { mytorus  }
      object { mybox }
      translate <0.1,0,0.1> 
      no_shadow                                                       
    }
    difference {
      object {mytorus }
      object {mybox }
      no_shadow
    }
    rotate <-90,5,0>
  }                                        