//Pixel width for characters
//Obviously assumes no kerning, no ligatures, no wrapping, etc.
//Only supports ASCII; otherwise it assumes a default average character width.
//It's also missing a lot of weird thin spaces and such.
const widths = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0.2796875,
  0.2765625,
  0.3546875,
  0.5546875,
  0.5546875,
  0.8890625,
  0.665625,
  0.190625,
  0.3328125,
  0.3328125,
  0.3890625,
  0.5828125,
  0.2765625,
  0.3328125,
  0.2765625,
  0.3015625,
  0.5546875,
  0.5546875,
  0.5546875,
  0.5546875,
  0.5546875,
  0.5546875,
  0.5546875,
  0.5546875,
  0.5546875,
  0.5546875,
  0.2765625,
  0.2765625,
  0.584375,
  0.5828125,
  0.584375,
  0.5546875,
  1.0140625,
  0.665625,
  0.665625,
  0.721875,
  0.721875,
  0.665625,
  0.609375,
  0.7765625,
  0.721875,
  0.2765625,
  0.5,
  0.665625,
  0.5546875,
  0.8328125,
  0.721875,
  0.7765625,
  0.665625,
  0.7765625,
  0.721875,
  0.665625,
  0.609375,
  0.721875,
  0.665625,
  0.94375,
  0.665625,
  0.665625,
  0.609375,
  0.2765625,
  0.3546875,
  0.2765625,
  0.4765625,
  0.5546875,
  0.3328125,
  0.5546875,
  0.5546875,
  0.5,
  0.5546875,
  0.5546875,
  0.2765625,
  0.5546875,
  0.5546875,
  0.221875,
  0.240625,
  0.5,
  0.221875,
  0.8328125,
  0.5546875,
  0.5546875,
  0.5546875,
  0.5546875,
  0.3328125,
  0.5,
  0.2765625,
  0.5546875,
  0.5,
  0.721875,
  0.5,
  0.5,
  0.5,
  0.3546875,
  0.259375,
  0.353125,
  0.5890625,
];
export default widths;
