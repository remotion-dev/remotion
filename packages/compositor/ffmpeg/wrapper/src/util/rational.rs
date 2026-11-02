use std::cmp::Ordering;
use std::fmt;
use std::ops::{Add, Div, Mul, Sub};

use ffi::*;
use libc::c_int;

#[derive(Copy, Clone)]
pub struct Rational(pub i32, pub i32);

impl Rational {
    #[inline]
    pub fn new(numerator: i32, denominator: i32) -> Self {
        Rational(numerator, denominator)
    }

    #[inline]
    pub fn numerator(&self) -> i32 {
        self.0
    }

    #[inline]
    pub fn denominator(&self) -> i32 {
        self.1
    }

    #[inline]
    pub fn reduce(&self) -> Rational {
        match self.reduce_with_limit(i32::MAX) {
            Ok(r) => r,
            Err(r) => r,
        }
    }

    #[inline]
    pub fn reduce_with_limit(&self, max: i32) -> Result<Rational, Rational> {
        unsafe {
            let mut dst_num: c_int = 0;
            let mut dst_den: c_int = 0;

            let exact = av_reduce(
                &mut dst_num,
                &mut dst_den,
                i64::from(self.numerator()),
                i64::from(self.denominator()),
                i64::from(max),
            );

            if exact == 1 {
                Ok(Rational(dst_num, dst_den))
            } else {
                Err(Rational(dst_num, dst_den))
            }
        }
    }

    #[inline]
    pub fn invert(&self) -> Rational {
        unsafe { Rational::from(av_inv_q((*self).into())) }
    }
}

impl From<AVRational> for Rational {
    #[inline]
    fn from(value: AVRational) -> Rational {
        Rational(value.num, value.den)
    }
}

impl From<Rational> for AVRational {
    #[inline]
    fn from(value: Rational) -> AVRational {
        AVRational {
            num: value.0,
            den: value.1,
        }
    }
}

impl From<f64> for Rational {
    #[inline]
    fn from(value: f64) -> Rational {
        unsafe { Rational::from(av_d2q(value, c_int::MAX)) }
    }
}

impl From<Rational> for f64 {
    #[inline]
    fn from(value: Rational) -> f64 {
        unsafe { av_q2d(value.into()) }
    }
}

impl From<Rational> for u32 {
    #[inline]
    fn from(value: Rational) -> u32 {
        unsafe { av_q2intfloat(value.into()) }
    }
}

impl From<(i32, i32)> for Rational {
    fn from((num, den): (i32, i32)) -> Rational {
        Rational::new(num, den)
    }
}

impl PartialEq for Rational {
    fn eq(&self, other: &Rational) -> bool {
        if self.0 == other.0 && self.1 == other.1 {
            return true;
        }

        let a = self.reduce();
        let b = other.reduce();

        if a.0 == b.0 && a.1 == b.1 {
            return true;
        }

        false
    }
}

impl Eq for Rational {}

impl PartialOrd for Rational {
    #[inline]
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        unsafe {
            match av_cmp_q((*self).into(), (*other).into()) {
                0 => Some(Ordering::Equal),
                1 => Some(Ordering::Greater),
                -1 => Some(Ordering::Less),

                _ => None,
            }
        }
    }
}

impl Add for Rational {
    type Output = Rational;

    #[inline]
    fn add(self, other: Rational) -> Rational {
        unsafe { Rational::from(av_add_q(self.into(), other.into())) }
    }
}

impl Sub for Rational {
    type Output = Rational;

    #[inline]
    fn sub(self, other: Rational) -> Rational {
        unsafe { Rational::from(av_sub_q(self.into(), other.into())) }
    }
}

impl Mul for Rational {
    type Output = Rational;

    #[inline]
    fn mul(self, other: Rational) -> Rational {
        unsafe { Rational::from(av_mul_q(self.into(), other.into())) }
    }
}

impl Div for Rational {
    type Output = Rational;

    #[inline]
    fn div(self, other: Rational) -> Rational {
        unsafe { Rational::from(av_div_q(self.into(), other.into())) }
    }
}

impl fmt::Display for Rational {
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        f.write_str(&format!("{}/{}", self.numerator(), self.denominator()))
    }
}

impl fmt::Debug for Rational {
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        f.write_str(&format!(
            "Rational({}/{})",
            self.numerator(),
            self.denominator()
        ))
    }
}

#[inline]
pub fn nearer(q: Rational, q1: Rational, q2: Rational) -> Ordering {
    unsafe {
        match av_nearer_q(q.into(), q1.into(), q2.into()) {
            1 => Ordering::Greater,
            -1 => Ordering::Less,
            _ => Ordering::Equal,
        }
    }
}
