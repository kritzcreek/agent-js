import Pipe from 'buffer-pipe';
import { Buffer } from 'buffer/';
import {
  lebDecode,
  lebEncode,
  readIntLE,
  readUIntLE,
  slebDecode,
  slebEncode,
  writeIntLE,
  writeUIntLE,
} from './leb128';

test('leb', () => {
  expect(lebEncode(0).toString('hex')).toBe('00');
  expect(lebEncode(7).toString('hex')).toBe('07');
  expect(lebEncode(127).toString('hex')).toBe('7f');
  expect(() => lebEncode(-1).toString('hex')).toThrow();
  expect(lebEncode(1).toString('hex')).toBe('01');
  expect(lebEncode(624485).toString('hex')).toBe('e58e26');
  expect(lebEncode(BigInt('0x1234567890abcdef1234567890abcdef')).toString('hex')).toBe(
    'ef9baf8589cf959a92deb7de8a929eabb424',
  );
  expect(lebEncode(BigInt(2000000)).toString('hex')).toBe('80897a');
  expect(lebEncode(BigInt(60000000000000000)).toString('hex')).toBe('808098f4e9b5ca6a');
  expect(lebEncode(BigInt(60000000000000000)).toString('hex')).toBe('808098f4e9b5ca6a');

  expect(lebDecode(new Pipe(Buffer.from([0])))).toBe(BigInt(0));
  expect(lebDecode(new Pipe(Buffer.from([1])))).toBe(BigInt(1));
  expect(lebDecode(new Pipe(Buffer.from([0xe5, 0x8e, 0x26])))).toBe(BigInt(624485));
  expect(
    lebDecode(new Pipe(Buffer.from('ef9baf8589cf959a92deb7de8a929eabb424', 'hex'))).toString(16),
  ).toBe('1234567890abcdef1234567890abcdef');
});

test('sleb', () => {
  expect(slebEncode(-1).toString('hex')).toBe('7f');
  expect(slebEncode(-123456).toString('hex')).toBe('c0bb78');
  expect(slebEncode(42).toString('hex')).toBe('2a');
  expect(slebEncode(BigInt('0x1234567890abcdef1234567890abcdef')).toString('hex')).toBe(
    'ef9baf8589cf959a92deb7de8a929eabb424',
  );
  expect(slebEncode(-BigInt('0x1234567890abcdef1234567890abcdef')).toString('hex')).toBe(
    '91e4d0faf6b0eae5eda1c8a1f5ede1d4cb5b',
  );
  expect(slebEncode(BigInt('2000000')).toString('hex')).toBe('8089fa00');
  expect(slebEncode(BigInt('60000000000000000')).toString('hex')).toBe('808098f4e9b5caea00');

  expect(slebDecode(new Pipe(Buffer.from([0x7f])))).toBe(BigInt(-1));
  expect(Number(slebDecode(new Pipe(Buffer.from([0xc0, 0xbb, 0x78]))))).toBe(-123456);
  expect(slebDecode(new Pipe(Buffer.from([0x2a])))).toBe(BigInt(42));
  expect(
    slebDecode(new Pipe(Buffer.from('91e4d0faf6b0eae5eda1c8a1f5ede1d4cb5b', 'hex'))).toString(16),
  ).toBe('-1234567890abcdef1234567890abcdef');
  expect(slebDecode(new Pipe(Buffer.from('808098f4e9b5caea00', 'hex'))).toString()).toBe(
    '60000000000000000',
  );
});

test('IntLE', () => {
  expect(writeIntLE(42, 2).toString('hex')).toBe('2a00');
  expect(writeIntLE(-42, 3).toString('hex')).toBe('d6ffff');
  expect(writeIntLE(1234567890, 5).toString('hex')).toBe('d202964900');
  expect(writeUIntLE(1234567890, 5).toString('hex')).toBe('d202964900');
  expect(writeIntLE(-1234567890, 5).toString('hex')).toBe('2efd69b6ff');
  expect(readIntLE(new Pipe(Buffer.from('d202964900', 'hex')), 5).toString()).toBe('1234567890');
  expect(readUIntLE(new Pipe(Buffer.from('d202964900', 'hex')), 5).toString()).toBe('1234567890');
  expect(readIntLE(new Pipe(Buffer.from('2efd69b6ff', 'hex')), 5).toString()).toBe('-1234567890');
  expect(readIntLE(new Pipe(Buffer.from('d6ffffffff', 'hex')), 5).toString()).toBe('-42');
  expect(readUIntLE(new Pipe(Buffer.from('d6ffffffff', 'hex')), 5).toString()).toBe(
    '1099511627734',
  );
});
