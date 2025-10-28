module.exports = async function handler(_req, res) {
  res.json({
    copyright: `© ${new Date().getFullYear()} Autor ili Kompanija. Sva prava zadržana.`,
    poruka:
      'Ovaj servis ne hostuje niti linkuje torrent/magnet sadržaj. Metapodaci i slike: TMDB i/ili TVmaze. Ovaj proizvod koristi TMDB API ali nije odobren niti sertifikovan od strane TMDB.',
  });
};

