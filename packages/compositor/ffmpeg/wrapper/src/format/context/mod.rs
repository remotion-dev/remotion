pub mod destructor;
pub use self::destructor::Destructor;

pub mod input;
pub use self::input::Input;

pub mod output;
pub use self::output::Output;

#[doc(hidden)]
pub mod common;

pub enum Context {
    Input(Input),
    Output(Output),
}

unsafe impl Send for Context {}

impl Context {
    pub fn is_input(&self) -> bool {
        matches!(*self, Context::Input(..))
    }

    pub fn input(self) -> Input {
        if let Context::Input(context) = self {
            return context;
        }

        unreachable!();
    }

    pub fn is_output(&self) -> bool {
        matches!(*self, Context::Output(..))
    }

    pub fn output(self) -> Output {
        if let Context::Output(context) = self {
            return context;
        }

        unreachable!();
    }
}
