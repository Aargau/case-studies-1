---
layout: post
title:  "AllJoyn 101: Getting Started with AllJoyn using the Heatworks Model 1"
author: "Ivan Judson"
author-link: "#"
#author-image: "{{ site.baseurl }}/images/ivanjudson/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: AllJoyn
color: "blue"
#image: "{{site.baseurl}}/images/imagename.png" #should be ~350px tall
excerpt: This document provides an overview of Alljoyn and working with the Heatworks water heater.
---

The problem ISI Technology – and all companies developing Internet-of-Things devices -- faced was the challenge of adding network accessibility to their physical device. ISI chose AllJoyn as the protocol the Heatworks Model 1 would implement to enable it to work with a variety of other devices. During the Microsoft Ventures Redmond Accelerator’s Fall 2014 session, ISI started working with Qualcomm to build a hardware interface board to enable IoT integration with their product, using the AllJoyn protocol.   After the hardware interface is built, the Heatworks Model 1 device will still need software to expose it as an AllJoyn Service so that AllJoyn enabled applications can interact with it.

![Figure 1]({{site.baseurl}}/images/2015-07-21-alljoyn-heatworks_images/image001.png)

## Overview of the Solution

In order to accelerate ISI Technologies’ ability to network-enable their Heatworks Model 1, we built an example implementation of the AllJoyn interface, including the server side code and client test code.  It is published on github here: https://github.com/irjudson/heatworks-model1\.

This implementation leaves out the calls that would manipulate the hardware directly, which ISI Technology (or any device provider) needs to implement. The basic architecture for AllJoyn Devices is shown above. This example implementation leverages the [AllJoyn Thin Core](https://allseenalliance.org/developers/learn/core/thin-core) (https://allseenalliance.org/developers/learn/core/thin-core), a version of the software optimized for embedded devices, so that ISI Technologies has the widest set of choices for hardware for the interface.

Through the process of developing this solution, it became clear that building AllJoyn services using the AllJoyn Thin Client is not difficult, but much of the work could be automated with smarter tooling. Once the device interface is defined, both server and client side code could be automatically generated, reducing the work for device manufacturers to enable their devices with AllJoyn capabilities. Both Microsoft and the AllSeen Alliance have released tools that simplify the creation of the solution. The AllSeen Alliance tool is here: https://wiki.allseenalliance.org/devtools/code_generator, and the Microsoft tool is here: https://msdn.microsoft.com/en-us/library/dn913809.aspx.

## Code Artifacts

All of the code for this case study lives in a GitHub repository at: [https://github.com/irjudson/heatworks-model1](https://github.com/irjudson/heatworks-model1). The code for this implementation is very small; illustrative snippets have been included it below.

The AllJoyn Interface Description is written by the application programmer and is used to do the following:

- AllJoyn Thin Core broadcasts the AllJoyn Interface Description on the local network so that clients can find services to interact with.
- All of the client and server code is generated from this interface description. The generated code has placeholders for the code used to interact with the device, as highlighted below.

Here is the AllJoyn Interface Description for the Heatworks Model 1:

```
<node name="/control">
  <interface name="com.myheatworks.model1">
    <method name="setPoint">
      <arg name="temp" type="y" direction="in"/>
    </method>
    <method name="currentTemp">
      <arg name="temp" type="y" direction="out"/>
    </method>
    <method name="softCurrentLimit">
      <arg name="current" type="y" direction="in"/>
    </method>
    <method name="currentDrawInstant">
      <arg name="current" type="y" direction="out"/>
    </method>
    <method name="timeOdometerValue">
      <arg name="time" type="i" direction="out"/>
    </method>
    <method name="currentOdometerValue">
      <arg name="current" type="i" direction="out"/>
    </method>
  </interface>
</node>
```

Here is a sample of the generated server code, highlighting the two sections of device-specific code that the developer needs to add.

**model1_service.c:**

```
#define BASIC_SERVICE_SETPOINT             AJ_APP_MESSAGE_ID(0, 0, 0)
#define BASIC_SERVICE_CURRENT_TEMP         AJ_APP_MESSAGE_ID(0, 0, 1)
#define BASIC_SERVICE_SOFT_CURRENT_LIMIT   AJ_APP_MESSAGE_ID(0, 0, 2)
#define BASIC_SERVICE_CURRENT_DRAW_INSTANT AJ_APP_MESSAGE_ID(0, 0, 3)
#define BASIC_SERVICE_TIME_ODOMETER        AJ_APP_MESSAGE_ID(0, 0, 4)
#define BASIC_SERVICE_CURRENT_ODOMETER     AJ_APP_MESSAGE_ID(0, 0, 5)

int main(int argc, char **argv)
{
    <…>

    /* One time initialization before calling any other AllJoyn APIs. */
    AJ_Initialize();
    AJ_RegisterObjects(AppObjects, NULL);

    while (TRUE) {
        AJ_Message msg;

        if (!connected) {
            status = AJ_StartService(&bus,
                                     NULL,
                                     CONNECT_TIMEOUT,
                                     FALSE,
                                     ServicePort,
                                     ServiceName,
                                     AJ_NAME_REQ_DO_NOT_QUEUE,
                                     NULL);

           <…>
            connected = TRUE;
        }

        status = AJ_UnmarshalMsg(&bus, &msg, UNMARSHAL_TIMEOUT);

       <…>

        if (AJ_OK == status) {
            switch (msg.msgId) {

        <…>

case BASIC_SERVICE_SETPOINT:
                {
                    uint8_t setPoint = 40;
                    AJ_Message reply;
                    AJ_UnmarshalArgs(&msg, "y", &setPoint);
                    /* Check bounds */
                    if (setPoint > SPMIN && setPoint << SPMAX) {
                        AJ_AlwaysPrintf(("Setting set point to: %d F.\n", setPoint));
                        /* Make set setpoint call */
                        AJ_MarshalReplyMsg(&msg, &reply);
                        AJ_InfoPrintf(("Set target water temperature returned %d, session_id=%u\n", status, sessionId));
                    } else {

                    }
                    status = AJ_DeliverMsg(&reply);
                }
                break;

           <…>

            case BASIC_SERVICE_SOFT_CURRENT_LIMIT:
                {
                    uint8_t currentLimit = 10;
                    AJ_Message reply;
                    AJ_UnmarshalArgs(&msg, "y", &currentLimit);
                    AJ_AlwaysPrintf(("Setting soft current limit to: %d amps.\n", currentLimit));
                    /* Actually set the soft current limit! */
                    AJ_MarshalReplyMsg(&msg, &reply);
                    AJ_InfoPrintf(("Setting soft current limit: returned %d, session_id=%u\n", status, sessionId));
                    status = AJ_DeliverMsg(&reply);
                }
                break;

            <…>

            default:
                /* Pass to the built-in handlers. */
                status = AJ_BusHandleBusMessage(&msg);
                break;
            }
        }

        /* Messages MUST be discarded to free resources. */
        AJ_CloseMsg(&msg);

        if ((status == AJ_ERR_SESSION_LOST || status == AJ_ERR_READ)) {
            AJ_AlwaysPrintf(("AllJoyn disconnect.\n"));
            AJ_Disconnect(&bus);
            connected = FALSE;
            /* Sleep a little while before trying to reconnect. */
            AJ_Sleep(SLEEP_TIME);
        }
    }

    AJ_AlwaysPrintf(("Basic service exiting with status %d.\n", status));
    return status;
}
```

## Opportunities for Reuse

This example implementation can be reused by anyone who wants to add AllJoyn support to their device.  Note that the implementation of the Heatworks Model1 AllJoyn functionality has device-specific code, so developers will need to customize this code to their own devices.

Having simple, easy-to-use example implementations that illuminate the required steps to implement AllJoyn for new devices is critical for AllJoyn Adoption. The AllSeen Alliance is embarking on a broad marketing and evangelism effort in 2015, having recently added 50 members – growing the number of members to 150 in the Alliance. Be sure to check the AllSeen Alliance website ([https://allseenalliance.org/](https://allseenalliance.org/)) regularly for new examples and updates.

The content of this case study was first presented at the Embedded Linux Conference 2015, and can be found at [https://github.com/irjudson/AJIntro](https://github.com/irjudson/AJIntro).
