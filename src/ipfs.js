import fs from 'fs'
import Promise from 'bluebird'
import Ipfs from 'ipfs-api'

const IPHF_HOST = process.env.IPHF_HOST || '';
const IPHF_PORT = process.env.IPHF_PORT || '5001';
const ipfs = Ipfs(IPHF_HOST, IPHF_PORT)

export default ipfs

export const pin = (hash) => {
  const pinAsync = Promise.promisify(ipfs.pin.add);
  return pinAsync(hash);
}
