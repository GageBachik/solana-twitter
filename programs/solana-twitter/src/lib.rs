use anchor_lang::prelude::*;

declare_id!("4VCcbPSY62WSRkE9RKnRHW4HsHsHwZcxMC6tQCRg49af");

// Business logic
#[program]
pub mod solana_twitter {
    use super::*;
    pub fn send_tweet(ctx: Context<SendTweet>, topic: String, content: String) -> ProgramResult {
        let clock = Clock::get().unwrap();
        let tweet = &mut ctx.accounts.tweet;

        if topic.chars().count() > 16 {
            return Err(ErrorCode::TopicTooLong.into());
        }

        if content.chars().count() > 140 {
            return Err(ErrorCode::ContentTooLong.into());
        }

        tweet.author = ctx.accounts.author.key();
        tweet.content = content;
        tweet.topic = topic;
        tweet.timestamp = clock.unix_timestamp;
        Ok(())
    }
}

// Data Validation
#[derive(Accounts)]
pub struct SendTweet<'info> {
    #[account(init, payer = author, space = Tweet::LEN)]
    pub tweet: Account<'info, Tweet>,
    #[account{mut}]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Data Structures

#[account]
pub struct Tweet {
    pub author: Pubkey,
    pub content: String,
    pub topic: String,
    pub timestamp: i64,
}

const DISCRIMINTOR_LENGTH: usize = 8; // prefix to identify the type of the struct/account
const AUTHOR_LENGHT: usize = 32;

const STRING_LENGTH_PREFIX: usize = 4; // prefix to identify the length of the string
const TOPIC_LENGHT: usize = 16 * 4; // 16 chars max at 4 bytes each
const CONTENT_LENGHT: usize = 140 * 4; // 180 chars max at 4 bytes each

const TIMESTAMP_LENGHT: usize = 8;

impl Tweet {
    const LEN: usize = DISCRIMINTOR_LENGTH
        + AUTHOR_LENGHT
        + STRING_LENGTH_PREFIX
        + TOPIC_LENGHT
        + STRING_LENGTH_PREFIX
        + CONTENT_LENGHT
        + TIMESTAMP_LENGHT;
}

// Error Handling

#[error]
pub enum ErrorCode {
    #[msg("The provided topic should be 16 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 140 characters long maximum.")]
    ContentTooLong,
}
