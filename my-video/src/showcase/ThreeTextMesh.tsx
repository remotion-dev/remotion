import {extend, useFrame} from "@react-three/fiber";
import {Fragment, useMemo, useRef} from "react";
import {interpolate, spring} from "remotion";
import type {Mesh} from "three";
import {TextGeometry, type Font} from "three-stdlib";

const TextGeometryEl = extend(TextGeometry);

const LETTER_SPACING = 0.1;
const EXTRUDE_DEPTH = 60;
const CHARACTER_SIZE = 2;

// One word of real extruded 3D typography: a solid "character" mesh running
// EXTRUDE_DEPTH deep, capped by a flat "surface" mesh -- both built from the
// same TextGeometry per character, since a font's glyph outlines are only
// known once the geometry exists (computeBoundingBox() runs in useFrame(),
// not at render time). Each character is placed along x by its own measured
// width so they sit flush next to each other; the whole word flips in from
// behind the camera together on one spring().
export const ThreeTextMesh: React.FC<{
  frame: number;
  fps: number;
  text: string;
  position: number;
  font: Font;
}> = ({frame, fps, text, position, font}) => {
  const characters = useMemo(() => text.split(""), [text]);
  const surfaceRefs = useRef<(Mesh | null)[]>([]);
  const characterRefs = useRef<(Mesh | null)[]>([]);

  const progress = spring({frame, fps, config: {damping: 15, mass: 1}});
  const z = interpolate(progress, [0, 1], [-40, 0]);

  useFrame(() => {
    const widths = characterRefs.current.map((mesh) => {
      const box = mesh?.geometry;
      box?.computeBoundingBox();
      const bounds = box?.boundingBox;
      return bounds ? bounds.max.x - bounds.min.x : 0;
    });
    const totalWidth = widths.reduce((sum, width) => sum + width + LETTER_SPACING, LETTER_SPACING);

    let cursor = -totalWidth / 2;
    widths.forEach((width, i) => {
      const x = cursor;
      cursor += width + LETTER_SPACING;
      const surface = surfaceRefs.current[i];
      const character = characterRefs.current[i];
      if (surface) {
        surface.position.x = x;
        surface.position.z = z + 0.01;
      }
      if (character) {
        character.position.x = x;
        character.position.z = z - EXTRUDE_DEPTH;
      }
    });
  });

  return (
    <group rotation={[-Math.PI / 10, Math.PI / 10, 0.1]} position={[0.5, position, 0]}>
      {characters.map((char, i) => (
        <Fragment key={i}>
          <mesh ref={(el: Mesh | null) => (characterRefs.current[i] = el)}>
            <TextGeometryEl args={[char, {font, size: CHARACTER_SIZE, height: EXTRUDE_DEPTH}]} />
            <meshBasicMaterial color="#6366f1" />
          </mesh>
          <mesh ref={(el: Mesh | null) => (surfaceRefs.current[i] = el)}>
            <TextGeometryEl args={[char, {font, size: CHARACTER_SIZE, height: 0}]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </Fragment>
      ))}
    </group>
  );
};
