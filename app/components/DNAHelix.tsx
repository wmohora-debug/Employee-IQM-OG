import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function DNAHelix() {
    const groupRef = useRef<THREE.Group>(null);

    const { pointPositions, linePositions } = useMemo(() => {
        const pPositions: number[] = [];
        const lPositions: number[] = [];
        const count = 120; // Number of base pairs
        const radius = 1.5;
        const height = 10;
        const turns = 3;

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const y = (t - 0.5) * height;
            const angle = t * Math.PI * 2 * turns;

            // Strand 1
            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;
            pPositions.push(x1, y, z1);

            // Strand 2
            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;
            pPositions.push(x2, y, z2);

            // Connect strands with a line
            lPositions.push(x1, y, z1);
            lPositions.push(x2, y, z2);
        }

        return {
            pointPositions: new Float32Array(pPositions),
            linePositions: new Float32Array(lPositions)
        };
    }, []);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.2; // Slow vertical spin
        }
    });

    return (
        <group ref={groupRef}>
            {/* The Points for the DNA backbone */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={pointPositions.length / 3}
                        array={pointPositions}
                        itemSize={3}
                        args={[pointPositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    color="#a78bfa" // iqm-purple light
                    transparent
                    opacity={0.9}
                    sizeAttenuation
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* The Lines for the DNA base pairs */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={linePositions.length / 3}
                        array={linePositions}
                        itemSize={3}
                        args={[linePositions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#8b5cf6" // iqm-purple
                    transparent
                    opacity={0.4}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>
        </group>
    );
}
