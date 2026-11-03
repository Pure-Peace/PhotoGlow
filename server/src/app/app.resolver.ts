import { Query, Resolver } from '@nestjs/graphql'

@Resolver()
export class AppResolver {
  @Query(() => Boolean)
  running(): boolean {
    return true
  }
}
