#version 100

#define EPSILON 0.001

uniform mat4 cameraMatrix;
uniform vec2 viewResolution;

float pixelRes;

struct Planet {
    vec4 position;
    float radius;
    vec4 colour;
}

struct Star {
    vec4 position;
    float radius;
    vec4 colour;
}

struct Ring {
    vec4 position;
    vec3 normal;
    float innerRadius;
    float width;
    vec4 colour;
}

uniform Planet planets[100];
uniform Star stars[10];
uniform Ring rings[100];

/** Quickly calculate the square of a number. */
float square(float f) {
    return f * f;
}

/** Distance estimator for a sphere. */
float distanceToSphere(vec3 position, float sphereRadius) {
    return length(position) - sphereRadius;
}

/** Distance estimator for a plane. */
float distanceToPlane(vec3 position, vec3 planeOrigin, vec3 planeNormal) {
    return length(dot(position - planeOrigin, planeNormal));
}

/** Project a point onto a plane. 
    i.e: Where a normal vector starting on the plane would have to originate
    in order for it to point directly at our point. */
vec3 projectPointOntoPlane(vec3 position, vec3 planeOrigin, vec3 planeNormal) {
    float dist = distanceToPlane(position, planeOrigin, planeNormal);
    return position - dist * planeNormal;
}

/** Distance estimator for a ring. Since this one is more complicated, our level
    of detail goes up as we get closer. */
float distanceToRing(vec3 position, vec3 ringOrigin, vec3 ringNormal, 
        float ringInnerRadius, float ringWidth) { //, float ringStartAngle, float ringArc) {

    // If we're outside the ring's outer radius, skip all the complicated stuff and
    // just pretend the ring is a sphere.
    float distanceToOrigin = length(position - ringOrigin);
    if(distanceToOrigin > ringInnerRadius + ringWidth + 1) {
        return ringInnerRadius + ringWidth;
    }

    // Otherwise, we're close enough to the ring that there's an actual chance of
    // hitting it, so do the actual distance calculation.
    float dist = distanceToPlane(position, ringOrigin, ringNormal);
    
    if(dist <= EPSILON) {
        // We're close enough to the plane, let's check if we're actually on the ring.
        if(distanceToOrigin > ringInnerRadius) {
            if(distanceToOrigin < ringInnerRadius + ringWidth) {
                return 0.0;
            } else {
                return distanceToOrigin - ringInnerRadius + ringWidth;
            }
        } else {
            return ringInnerRadius - distanceToOrigin;
        }
    } else {
        // We're within the sphere but not close enough to the plane, so we have to find
        // out how far we are from the ring.
        vec3 localisedPosition = projectPointOntoPlane(position, ringOrigin, ringNormal);
        float localisedDistanceToOrigin = length(localisedPosition - ringOrigin);

        if(localisedDistanceToOrigin < ringInnerRadius) {
            return sqrt(square(ringInnerRadius - localisedDistanceToOrigin) + square(dist * ringNormal));
        } else if(localisedDistanceToOrigin > ringInnerRadius + ringWidth) {
            return sqrt(square(ringInnerRadius + ringWidth - localisedDistanceToOrigin) + square(dist * ringNormal));
        } else {
            return dist;
        }
    }
}

void main() {
    pixelRes = 1.0 / viewResolution.x;

    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
} 