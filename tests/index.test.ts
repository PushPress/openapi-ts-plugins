import { listUsersSafe } from '../src/client/neverthrow.gen';
import { ok } from 'neverthrow';

async function testApi() {
  const users = await listUsersSafe({});
  users.match(
    (res) => res.data.users,
    (err) => err,
  );
  users.andThen((res) => ok(res.data!.users[0]!));
}

testApi();
