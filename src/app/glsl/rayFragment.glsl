#version 100

#define EPSILON 0.001

uniform mat4 cameraMatrix;
uniform vec2 viewResolution;

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
    float dist = distanceToPlane(position, ringOrigin, ringNormal);

    if(dist > ringInnerRadius + ringWidth - EPSILON) {
        return ringInnerRadius + ringWidth;
    } else if(dist <= EPSILON) {
        return 0.0;
    } else {
        vec3 localisedPosition = projectPointOntoPlane(position, ringOrigin, ringNormal);
        float distanceToOrigin = length(localisedPosition - ringOrigin);

        if(distanceToOrigin < ringInnerRadius) {
            return sqrt(square(ringInnerRadius - distanceToOrigin) + square(dist * ringNormal));
        } else if(distanceToOrigin > ringInnerRadius + ringWidth) {
            return sqrt(square(ringInnerRadius + ringWidth - distanceToOrigin) + square(dist * ringNormal));
        } else {
            return dist;
        }
    }
}

void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
} 