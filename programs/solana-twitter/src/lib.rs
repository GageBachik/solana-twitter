use anchor_lang::prelude::*;

declare_id!("4VCcbPSY62WSRkE9RKnRHW4HsHsHwZcxMC6tQCRg49af");

#[program]
pub mod solana_twitter {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
