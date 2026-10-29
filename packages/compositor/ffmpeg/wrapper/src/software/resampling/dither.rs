use ffi::SwrDitherType::*;
use ffi::*;

#[derive(Eq, PartialEq, Copy, Clone, Debug)]
pub enum Dither {
    None,
    Rectangular,
    Triangular,
    TriangularHighPass,

    NoiseShapingLipshitz,
    NoiseShapingFWeighted,
    NoiseShapingModifiedEWeighted,
    NoiseShapingImprovedEWeighted,
    NoiseShapingShibata,
    NoiseShapingLowShibata,
    NoiseShapingHighShibata,
}

impl From<SwrDitherType> for Dither {
    fn from(value: SwrDitherType) -> Dither {
        match value {
            SWR_DITHER_NONE => Dither::None,
            SWR_DITHER_RECTANGULAR => Dither::Rectangular,
            SWR_DITHER_TRIANGULAR => Dither::Triangular,
            SWR_DITHER_TRIANGULAR_HIGHPASS => Dither::TriangularHighPass,

            SWR_DITHER_NS => Dither::None,
            SWR_DITHER_NS_LIPSHITZ => Dither::NoiseShapingLipshitz,
            SWR_DITHER_NS_F_WEIGHTED => Dither::NoiseShapingFWeighted,
            SWR_DITHER_NS_MODIFIED_E_WEIGHTED => Dither::NoiseShapingModifiedEWeighted,
            SWR_DITHER_NS_IMPROVED_E_WEIGHTED => Dither::NoiseShapingImprovedEWeighted,
            SWR_DITHER_NS_SHIBATA => Dither::NoiseShapingShibata,
            SWR_DITHER_NS_LOW_SHIBATA => Dither::NoiseShapingLowShibata,
            SWR_DITHER_NS_HIGH_SHIBATA => Dither::NoiseShapingHighShibata,
            SWR_DITHER_NB => Dither::None,
        }
    }
}

impl From<Dither> for SwrDitherType {
    fn from(value: Dither) -> SwrDitherType {
        match value {
            Dither::None => SWR_DITHER_NONE,
            Dither::Rectangular => SWR_DITHER_RECTANGULAR,
            Dither::Triangular => SWR_DITHER_TRIANGULAR,
            Dither::TriangularHighPass => SWR_DITHER_TRIANGULAR_HIGHPASS,

            Dither::NoiseShapingLipshitz => SWR_DITHER_NS_LIPSHITZ,
            Dither::NoiseShapingFWeighted => SWR_DITHER_NS_F_WEIGHTED,
            Dither::NoiseShapingModifiedEWeighted => SWR_DITHER_NS_MODIFIED_E_WEIGHTED,
            Dither::NoiseShapingImprovedEWeighted => SWR_DITHER_NS_IMPROVED_E_WEIGHTED,
            Dither::NoiseShapingShibata => SWR_DITHER_NS_SHIBATA,
            Dither::NoiseShapingLowShibata => SWR_DITHER_NS_LOW_SHIBATA,
            Dither::NoiseShapingHighShibata => SWR_DITHER_NS_HIGH_SHIBATA,
        }
    }
}
