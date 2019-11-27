// POV-Ray 3.6 / 3.7 scene file  "povlens2.pov"
// author: Friedrich A. Lohmueller 2003/Aug-2009/Jan-2011
// email:  Friedrich.Lohmueller_at_t-online.de
// homepage: http://www.f-lohmueller.de
//
// biconvex optical lens
#version 3.6; // 3.7;
global_settings{ assumed_gamma 1.0 }
#default{ finish{ ambient 0.1 diffuse 0.9 }} 

#include "colors.inc"
#include "textures.inc"
#include "glass.inc"      //  !!!! ---> T_Glass3 
// camera -------------------------------------------------------
camera {angle 35
        location  < 8.0*0.7 , 2.0,-6.5*0.7>
        right x*image_width/image_height
        look_at   < 0 , 0 , 0.0>}
// sun ----------------------------------------------------------
light_source{<1000,2500,-2500> color White}
// sky ----------------------------------------------------------
object{sphere {<0,0,0>,1 hollow }
          texture{pigment{gradient <0,1,0>
                          color_map{[0.00 color Gray]
                                    [0.35 color Gray]
                                    [0.50 color White]
                                    [0.65 color Gray]
                                    [1.00 color Gray] }
                          quick_color White 
                          scale 2 translate<0,-1,0>}
                  finish {ambient 1 diffuse 0}}
       scale 10000} // end of sphere


//------------------------------------------------------  lens ---
#declare R1    = 2.50;   //sphere radius
#declare Over1 = 0.25;   //sphere overlapping
#declare R2    = 5.50;   //sphere radius
#declare Over2 = 0.1;   //sphere overlapping
difference{
        intersection{
         sphere{<0,0,-R2+Over2>,R2 }
         sphere{<0,0,R2-Over2>,R2 }
         texture{T_Glass1 }interior{I_Glass2}
        }  
        box{<0,2,1>,<2,0,-1>} 
         texture{T_Glass1 }
        translate <0,0,-0.8>
}
difference{
        intersection{
         sphere{<0,0,-R1+Over1>,R1 }
         sphere{<0,0,R1-Over1>,R1 }
         texture{T_Glass1 }interior{I_Glass2}
        }  
        box{<0,2,1>,<2,0,-1>} 
         texture{T_Glass1 }
        translate <0,0,0.8>
        
}
//------------------------------------------------------- end ----


   




  




