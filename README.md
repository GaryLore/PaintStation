
# Paint Station


## Description

This is a live collaborative paint app which allows users to create a room that allows a max of 4 users to concurrently draw on the same canvas, 
and with a chat on the size. The canvas allows the selection of a variety of colors, with a custom width, and allows you to draw a stroke with
whatever stroke you draw getting filled inside by a color of your choice. There is also pan and zoom allowed.

### HomePage :
![](/assets/images/Homepage.jpg)
### Room :
![](/assets/images/Room.jpg?v=2)

## Tech Stack

- Java
- HTML 
- JavaScript
- CSS
- Canvas API
- Spring-Boot
- STOMP
- JWT

## Features

- Live Paint Canvas
- Up To 4 Users
- Chat Room
- Various Colors
- Custom Width of Paint Stroke
- Pan & Zoom
- Room Authentication with Passwords

## Installation

This tutorial teaches you how to run this application using intelij. Requires JDK 21

1. Clone Repository
```
git clone https://github.com/GaryLore/PaintStation.git PaintStation
```

2. Create Certificate using this link https://www.youtube.com/watch?v=emhAf7srIeg


3. Create a new file called **application-extra.properties** and put all the cert properties 
from that certificate video in this file except server.port=443 property since that property
is already included in the **application.properties file**. Put both ***application-extra.properties*** and ***keystore.p12***
in src/main/resources/. The reason for the certificate is to make our application HTTPS. HTTPS is needed
for using Javascript built in UUID, however LocalHost will allow UUID without HTTPS however once connected
from another computer(not localhost) you will come across errors if there is no HTTPS.


4. Add JWT properties to the **application-extra.properties** file as well
```
# JWT configuration
jwt.secret=please-change-this-secret-key-in-production-environment-32chars
jwt.expiration=15000
```


5. Using Intelij Activate the **application-extra.properties** profile by specifying Active Profiles to extra.
This is in configuration settings.
![](/assets/images/ActiveProfiles.jpg)
Or an alternative you can do to activate this extra profile is by going
in your **application.properties** file and inserting this line 
```
spring.profiles.active=extra
```

6. Use Maven to download all the dependencies


7. Run Spring boot App


8. Open with local host, or if you want to connect on other computers type https://[IP Address of computer running application]

Here is how to figure out your IP address

Open your cmd **On the computer that is running the application** and type 
```
ipconfig
```
Under IP config there should be something that looks like this

```
Wireless LAN adapter Wi-Fi:

IPv4 Address. . . . . . . . . . . : [IP ADDRESS]
```

Type this in your browser https://[IP ADDRESS]


## Attributions

Here are the attributions that are required for some of the free icons I used in my paint application

- <a href="https://www.flaticon.com/free-icons/paint-bucket" title="paint bucket icons">Paint bucket icons created by mynamepong - Flaticon</a>
- <a href="https://www.flaticon.com/free-icons/paint-brush" title="paint brush icons">Paint brush icons created by Freepik - Flaticon</a>
- <a href="https://www.flaticon.com/free-icons/magnify-glass" title="magnify glass icons">Magnify glass icons created by graphicmall - Flaticon</a>
- <a href="https://www.flaticon.com/free-icons/dustbin" title="dustbin icons">Dustbin icons created by Prosymbols Premium - Flaticon</a>

## Sources that helped me

### These first 3 links really helped jump start my project
- https://leimao.github.io/blog/HTML-Canvas-Mouse-Drawing/
- https://harrisonmilbradt.com/blog/canvas-panning-and-zooming
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

### These links helped more with the Backend
- https://www.youtube.com/watch?v=31KTdfRH6nY
- https://docs.spring.io/spring-framework/reference/web/websocket/stomp.html
- https://docs.spring.io/spring-integration/reference/channel/interceptors.html
- https://www.youtube.com/watch?v=iB__rLXGsas
- https://stackoverflow.com/questions/77854959/is-signature-in-jwt-base64-encoded
- https://medium.com/@tericcabrel/implement-jwt-authentication-in-a-spring-boot-3-application-5839e4fd8fac
- https://springboot-123.mizucoffee.com/en/blog/spring-boot-security-jwt-authentication/
- https://www.youtube.com/watch?v=emhAf7srIeg
- https://www.baeldung.com/spring-task-scheduler

### Other Sources
- I used MDN as documentation for various CSS and Javascript things I needed to know, MDN is one of the best documentations I have read and easy to understand
- Using Claude and Chatgpt as documentation really helped as well and discussing my ideas with it as well to see if the architecture I had in mine was correct or not.

## License

This project is licensed under the MIT License see [LICENSE](/LICENSE.txt) for more details.
