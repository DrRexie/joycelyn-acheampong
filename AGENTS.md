<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Website architecture
- Keep the advisor website at the index route with anchored service, advisor, and contact sections so visitors can explore the full offering in one page.
- Use shared UI components and global semantic design tokens for all interaction and styling to keep the brand consistent.
- Consultation enquiries open a prefilled email to the advisor; never imply an enquiry was sent or an appointment booked without a confirmed sending service.
