Title: readme
CSS: ../styles/pandoc.css 
HTML header: <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
  <style type="text/css">
      code{white-space: pre-wrap;}
      span.smallcaps{font-variant: small-caps;}
      span.underline{text-decoration: underline;}
      div.column{display: inline-block; vertical-align: top; width: 50%;}
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-AMS_CHTML-full" type="text/javascript"></script>
  <script src='../scripts/p5/p5.js'></script>
  <script src='../scripts/p5/p5.svg.js'></script>
  <script src='../scripts/p5/p5.dom.js'></script>
  <script src='../scripts/p5/p5.util.js'></script>
  <script src='../scripts/p5/p5.yup.js'></script>
  <script src='../scripts/vec2d.js'></script>
  <script src='../scripts/raytracing-2/optical_simulation.js'></script>
  <script src='../scripts/raytracing-2/optical_simulation_draw_p5.js'></script>
  <script src='../scripts/popouts.js'></script>
  <script src='../scripts/slides.js'></script>
HTML footer: <script>slideshow()</script>


<div class="chapterno">
Chapter 0
</div>

# <span style="font-family:monospace">readme</span>

Books have prefaces, but since this is a website as much as it is a book, it has a readme file instead.

## How this book came about.

When I started teaching optics to optometry students, I was a bit disappointed with the textbooks that covered optics. A lot of them were extremely difficult, even for someone with a maths degree (like me). Much of the explanation for the optical principles was lacking, or involved intricate figures with badly chosen labels on the points (such as $a, A, A', A''$ and so on, all of which could be easily confused). 

Clearly there was a need for a text to explain the optics concepts as simply as possible. This book (or website) is, hopefully, it.

## Using this Book.

This is an online textbook on basic optics and visual optics (that is, optics applied to the eye). But it's also interactive. Many of the figures can be manipulated by you, the reader, to gain additional insight into the optical principles being talked about. That means, though, that you, the reader, need to engage with the book just a little more than you would a regular textbook.

### Clickable Images

The simplest sort of interaction is a slideshow, as shown below. A slideshow looks like a regular image, except it has arrowheads to the left or right. If you click on these arrows, you will move the slideshow forwards or back. As you do so, the caption changes as well.

<figure>
<span class="slideshow-container">
<img src="media/one.svg" alt="This picture changes when you click on it." style="width:100.0%" /> 
<img src="media/two.svg" alt="This picture changes when you click on it." style="width:100.0%" />
</span>
<figcaption>
<strong>Figure 1</strong> This picture changes when you click on it.
</figcaption>
</figure>


### Interactive Images.

The other sort of image is fully interactive. These images have an icon like this: 
![](../styles/one-finger-click.svg) next to them. If you hold or click on the icon, the parts of the image that you can move or drag are lit up. Try it on the image below:

<figure id="Interact">
<div id="interactimg" class="canvas-div"></div>
<figcaption>

**Figure 2** Parts of this picture can be dragged around. You can see which parts by holding down the finger icon to the right hand side of the picture: red arrows appear around the white arrowhead, showing that it can be dragged around. As well as that, checkboxes and sliders (if present) can be checked or slid.  The checkboxes add components to the image.

This picture is taken from Chapter 6
</figcaption>
</figure>
<script src='scripts/interactive.js'></script>

If you ever want to get back to the original state of an interactive image, you have to refresh the page.

### Contacting me.

If you have any questions or suggestions for improvement, please [email me](mailto:william.mcilhagga@gmail.com)



