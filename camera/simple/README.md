# camera - simple

Demo shows how to:
1. stream video from a camera to a `VIDEO` element,
2. grab frames from the stream and draw them to the canvas, and
3. capturing frames to new IMG element.

[Live demo on Glitch](https://ix-camera-simple.glitch.me/), or [fork it](https://glitch.com/edit/#!/remix/ix-camera-simple).

The demo also contains a snippet of code showing how to list available cameras. This can be useful for devices with a front and rear camera, or when a USB camera is connected.


Read more:
* [Taking still photos with WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos)
* [Enumerating video inputs](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices)
* [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

# Things to try

* Can images be recorded periodically to the canvas or as new elements?
* Can the multiple image elements be positioned or animated in an interesting way?
* Can you make another button to toggle the camera on and off?
* Can the `captureToCanvas` function be modified to draw the image differently? The canvas supports a variety of drawing modes and filters, for example.
